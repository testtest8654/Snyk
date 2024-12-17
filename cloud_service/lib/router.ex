defmodule CloudService.Router do
  import Plug.Conn
  use Plug.Router

  plug :match
  plug Plug.Parsers,
       parsers: [:urlencoded, :multipart],
       pass: ["*/*"]
  plug :dispatch

  @default_headers [{"content-type", "text/html"}]

  def init(opts), do: opts

  defp send_page(conn, code, view, bindings) when is_binary(view) do
    content = CloudService.TemplateEngine.render_view view, bindings
    send_resp %{conn|resp_headers: @default_headers}, code, content
  end

  defp map_to_keyword_list(map) do
    Enum.map map, fn {key, value} -> {String.to_existing_atom(key), value} end
  end

  get "/" do
    conn = Plug.Conn.fetch_query_params(conn)
    page = Map.get conn.query_params, "page", "index"

    try do
      bindings = map_to_keyword_list conn.query_params |> Map.drop([:page])
      send_page conn, 200, page, bindings
    rescue
      _err -> send_page conn, 400, "error", error: "bad request"
    end
  end

  get "/show/:file" do
    if GenServer.call CloudService.UploadWorker, {:is_available, file} do
      send_resp conn, 200, File.read!("uploads/" <> file)
    else
      send_page conn, 404, "error", error: "file not found"
    end
  end

  get "/source.zip" do
    send_resp %{conn|resp_headers: [{"content-type", "application/zip"}]}, 200, File.read!("source.zip")
  end

  post "/api/upload" do
    %{"data" => data, "file" => upload} = conn.body_params
    case GenServer.call CloudService.UploadWorker, {:upload, data, upload} do
      {:ok, path} -> send_resp conn, 201, path
      {:error, error} -> send_resp conn, 400, Atom.to_string(error)
    end
  end

  match _, do: send_page conn, 404, "error", error: "page not found"
end
