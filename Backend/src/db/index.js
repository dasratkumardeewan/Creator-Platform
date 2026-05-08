import mongoose from "mongoose";
import { DB_Name } from "../constant.js";

const connect_DB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_Name}`,
    );
    console.log(
      "MongoDB Connection Successfull. HOST: ",
      connectionInstance.connection.host,
    );
  } catch (error) {
    console.log("MongoDB Connection Failed");
    process.exit(1);
  }
};

export default connect_DB;
