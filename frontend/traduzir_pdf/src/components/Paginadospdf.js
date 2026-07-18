import { useState } from "react"

function Paginadospdf() {
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState("")

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!arquivo) {
      setMensagem("Selecione um PDF primeiro")
      return
    }

    setCarregando(true)
    setMensagem("Traduzindo...")

    const formData = new FormData()
    formData.append("pdf", arquivo)

    try {
      const res = await fetch("http://localhost:3000/traduzir", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.erro || "Erro na tradução")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = arquivo.name.replace(".pdf", "_traduzido.pdf")
      a.click()
      URL.revokeObjectURL(url)

      setMensagem("Tradução concluída!")
    } catch (err) {
      setMensagem("Erro: " + err.message)
    }

    setCarregando(false)
  }

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Traduzir PDF</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setArquivo(e.target.files[0])}
          style={{ margin: "20px" }}
        />
        <br />
        <button
          type="submit"
          disabled={carregando}
          style={{
            padding: "10px 30px",
            fontSize: "16px",
            cursor: carregando ? "wait" : "pointer",
          }}
        >
          {carregando ? "Traduzindo..." : "Traduzir PDF"}
        </button>
      </form>
      {mensagem && <p style={{ marginTop: "20px" }}>{mensagem}</p>}
    </div>
  )
}

export default Paginadospdf
