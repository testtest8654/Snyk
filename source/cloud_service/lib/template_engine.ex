defmodule CloudService.TemplateEngine do
  def render_view(view, bindings \\ []) do
    filepath = Path.join ["lib/views", view <> ".eex"]

    case File.read filepath do
      {:ok, file} -> EEx.eval_string(file, assigns: bindings)
      {:error, error} -> raise "internal server error (#{Atom.to_string error})"
    end
  end
end
