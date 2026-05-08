import connect_DB from "./db/index.js";
import { app } from "./app.js";

connect_DB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("The app is listening on port ", process.env.PORT || 3000);
    });
  })
  .catch((error) => console.log(error?.message || "MongoDB Connection Failed"));
