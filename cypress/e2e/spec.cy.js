describe("Radio Online SPA", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000"); 
  });

  it("Carga la página y muestra el título", () => {
    cy.contains("Radio Online en Vivo").should("exist");
  });

  it("Permite buscar radios por género", () => {
    cy.get('input[placeholder*="Género"]').type("rock");
    cy.contains("Buscar").click();

    cy.contains("Cargando emisoras...").should("exist");
    cy.get("ul li").should("have.length.greaterThan", 0);
  });

  it("Permite buscar radios por país", () => {
    cy.get('input[placeholder*="País"]').type("Ecuador");
    cy.contains("Buscar").click();

    cy.get("ul li").should("have.length.greaterThan", 0);
  });

  it("Muestra reproductor dentro de cada tarjeta", () => {
    cy.get('input[placeholder*="Género"]').type("rock");
    cy.contains("Buscar").click();

    cy.get("audio").first().should("exist");
  });

  it("Permite marcar y desmarcar favoritos", () => {
    cy.get('input[placeholder*="Género"]').type("rock");
    cy.contains("Buscar").click();

    cy.get("ul li button").first().click(); // marcar favorito
    cy.contains("Mis Favoritos").should("exist");
    cy.get("ul li button").first().click(); // desmarcar favorito
  });

  it("La paginación funciona", () => {
    cy.get('input[placeholder*="Género"]').type("rock");
    cy.contains("Buscar").click();

    cy.contains("Siguiente ➡️").click();
    cy.contains("Página 2").should("exist");
  });
});
