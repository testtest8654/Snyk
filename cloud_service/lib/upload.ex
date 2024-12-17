defmodule CloudService.UploadWorker do
  use GenServer

  @check_every 5 * 60 * 1000
  @delete_after 10 * 60 * 1000

  @impl true
  def init(_) do
    table = :ets.new(:table, [
      :set,
      :public,
      {:read_concurrency, true},
      {:write_concurrency, true},
    ])
    {:ok, table, @check_every}
  end

  def start_link do
    GenServer.start_link __MODULE__, nil, name: __MODULE__
  end

  @impl true
  def handle_cast({:push, _element}, table) do
    {:noreply, table}
  end

  @impl true
  def handle_call({:upload, data, upload}, _from, table) do
    %Plug.Upload{filename: filename, content_type: content_type} = upload
    output_file = UUID.uuid4(:default) <> Path.extname(filename)
    raw = data |> String.replace("data:#{content_type};base64,", "")

    binary_content = case Base.decode64(raw) do
      {:ok, result} -> result
      _ -> nil
    end
    if binary_content == nil do
      {:reply, {:error, :bad_input}, table, @check_every}
    else
      response = case File.write("uploads/" <> output_file, binary_content) do
        :ok ->
          :ets.insert(table, {output_file, :os.system_time(:millisecond)})
          {:ok, output_file}
        error -> error
      end
      {:reply, response, table, @check_every}
    end
  end

  @impl true
  def handle_call({:is_available, filename}, _from, table) do
    response = case :ets.lookup(table, filename) do
      [{file, date}] when is_binary(file) and is_integer(date) -> true
      _ -> false
    end
    {:reply, response, table, @check_every}
  end

  defp delete_files(_table, []), do: nil
  defp delete_files(table, [file | tail]) do
    :ets.delete(table, file)
    delete_files(table, tail)
  end

  @impl true
  def handle_info(:timeout, table) do
    now = :os.system_time(:millisecond)
    expired_files = :ets.select(table, [{{:"$1", :"$2"}, [{:>=, {:-, now, :"$2"}, @delete_after}], [:"$1"]}])

    delete_files(table, expired_files)
    {:noreply, table, @check_every}
  end
end
