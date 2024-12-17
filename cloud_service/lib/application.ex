defmodule CloudService.Application do
  use Application

  @impl true
  def start(_type, _args), do: CloudService.Supervisor.start_link()
end
