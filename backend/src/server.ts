import { config } from "./config";
import { createApp } from "./app";

createApp().listen(config.port, () => {
  console.log(`Backend escuchando en el puerto ${config.port}`);
});
