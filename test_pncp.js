async function test() {
  try {
    const url = "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=20240101&dataFinal=20240101&pagina=1";
    console.log("Fetching: " + url);
    const res = await fetch(url);
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text.substring(0, 500));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
