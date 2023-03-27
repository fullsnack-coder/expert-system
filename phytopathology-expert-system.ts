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

    return parsedJSONValue.some((knowedSyntom) =>
      knowedSyntom.includes(parsedValue)
    );
  }
);

type EngineEvent<R = any> = {
  type: string;
  params?: R;
};

type Result = {
  name: string;
  tratamientos: string[];
};

listOfRules.forEach((rule) => {
  engine.addRule(rule);
});

async function initializeEngine() {
  const { events: matches } = (await engine.run({
    sintoma: "manchas blancas",
  })) as { events: EngineEvent<Result>[] };

  if (matches.length <= 0) return [];

  const result = {
    diagnostic: {
      matches: matches.map(({ type: eventType, params }) => {
        return {
          eventType,
          name: params?.name,
          tratamientos: params?.tratamientos,
        };
      }),
    },
  };

  return result;
}

initializeEngine().then((result) =>
  console.log(JSON.stringify(result, null, 2))
);

// TODO: Agregar un servidor para recibir los sintomas y devolver el resultado
