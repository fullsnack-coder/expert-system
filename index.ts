import cors from "cors";
import express, { Request, Response } from "express";
import engine from "./phytopathology-expert-system";
import { enfermedades } from "./knowledgeBase.json";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/enfermedades", (_: Request, response: Response) => {
  return response.json({
    message: "Mostrando todas las enfermedades",
    enfermedades,
  });
});

type TratamientoParams = {
  sintoma: string;
};

app.post(
  "/tratamiento",
  async (request: Request<any, any, TratamientoParams>, response: Response) => {
    const { sintoma } = request.body;
    const { events: matches = [] } = await engine.run({ sintoma });

    if (matches.length <= 0)
      return response.json({ ok: false, message: "No matches" });

    const result = {
      diagnostic: {
        matches: matches.map(({ type: eventType, params }: any) => {
          return {
            eventType,
            name: params?.name,
            tratamientos: params?.tratamientos,
          };
        }),
      },
    };

    return response.json({
      ok: true,
      message: "enfermedad encontrada",
      result,
    });
  }
);

app.listen(3333, () => {
  console.log("Server started on port 3333!");
});
