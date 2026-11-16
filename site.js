// Conteúdo do site (não é secreto). Edite à vontade.
// Fotos: deixe "" para usar o visual padrão. Para usar uma foto, coloque o arquivo na pasta
// do projeto (ex.: hero.jpg) e escreva o nome aqui.
window.SITE = {
  WHATSAPP: "5511987654321",            // só números, com 55 + DDD
  INSTAGRAM_USER: "barber._shoop_",     // sem o @
  ENDERECO: "Rua Exemplo, 123 - Centro, Sua Cidade - UF",
  HORARIOS: ["Segunda a sábado · 08:00 – 19:00", "Domingo · Fechado"],
  SOBRE: "Uma barbearia tradicional com olhar contemporâneo. Atendimento com hora marcada, ambiente reservado e profissionais dedicados a entregar precisão em cada corte e cada barba.",
  CARGOS: { "Gustavo": "Proprietário" },   // texto abaixo do nome (padrão: Barbeiro)
  DESCRICOES: {                         // texto por nome do serviço (igual ao cadastrado no banco)
    "Corte": "Corte masculino com acabamento preciso.",
    "Barba": "Barba alinhada e modelada com acabamento na navalha.",
    "Corte + Barba": "O combo completo para sair com o visual inteiro resolvido."
  },
  FOTOS: {
    hero: "",                           // ex.: "hero.jpg"
    sobre: "",                          // ex.: "barbearia.jpg"
    servicos: {},                       // ex.: { "Corte": "corte.jpg", "Barba": "barba.jpg" }
    equipe: {},                         // ex.: { "Gustavo": "gustavo.jpg", "Dudu": "dudu.jpg", "Breno": "breno.jpg" }
    destaques: [],                      // carrossel (troca a cada 5 s). ex.: [{ foto: "barba1.jpg", legenda: "Barba" }, { foto: "corte1.jpg", legenda: "Corte" }]
    galeria: []                         // ex.: ["g1.jpg","g2.jpg","g3.jpg","g4.jpg","g5.jpg","g6.jpg"]
  }
};
