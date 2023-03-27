const { Engine } = require("json-rules-engine");
let engine = new Engine();

engine.addRule({
  conditions: {
    all: [
      {
        fact: "sintoma",
        path: "$.hojas[*].manchas",
        operator: "contains",
        value: "marrones",
      },
    ],
  },
  event: {
    type: "enfermedad",
    params: {
      nombre: "mancha foliar marron",
    },
  },
});

engine.addRule({
  conditions: {
    all: [
      {
        fact: "sintoma",
        path: "$.raices.presenta.*",
        operator: "contains",
        value: "pudricion",
      },
    ],
  },
  event: {
    type: "enfermedad",
    params: {
      nombre: "pobredumbre de la raiz",
    },
  },
});

engine
  .run({
    sintoma: {
      raices: {
        presenta: ["pudricion"],
      },
    },
  })
  .then(({ events }) => {
    events.map((e) => console.log(e.params.nombre));
  })
  .catch(console.log);
