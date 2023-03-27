const { Engine } = require("json-rules-engine");
const { enfermedades } = require("./knowledgeBase.json");

type Enfermedad = {
  nombre: string;
  sintomas: string[];
  tratamientos: string[];
};

const listOfRules = (enfermedades as Enfermedad[]).map(
  ({ nombre, sintomas, tratamientos }) => {
    return {
      conditions: {
        all: [
          {
            fact: "sintoma",
            operator: "containsSyntom",
            path: "$.sintoma",
            value: sintomas,
          },
        ],
      },
      event: {
        type: "diagnostico",
        params: {
          name: nombre,
          tratamientos,
        },
      },
    };
  }
);

const engine = new Engine();

// factValue es el valor recibido por el sistema experto
// jsonValue es el valor que se encuentra en la base de conocimiento

engine.addOperator(
  "containsSyntom",
  (factValue: string, jsonValue: string[]) => {
    const parsedValue = factValue.toLowerCase();
    const parsedJSONValue = jsonValue.map((value) => value.toLowerCase());

    return parsedJSONValue.includes(parsedValue);
  }
);

listOfRules.forEach((rule) => {
  engine.addRule(rule);
});

engine.run({ sintoma: "blancas" }).then(({ events }: any) => {
  console.log(events);
});
