defmodule CloudService.Supervisor do
  use Supervisor

  def start_link(initial_state \\ []) do
    Supervisor.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  @impl true
  def init(_) do
    children = [
      %{
        id: CloudService.UploadWorker,
        start: {CloudService.UploadWorker, :start_link, []}
      },
      Plug.Cowboy.child_spec(scheme: :http, plug: CloudService.Router, options: [port: 4001]),
    ]

    Supervisor.init children, strategy: :one_for_one, name: __MODULE__
  end
end
