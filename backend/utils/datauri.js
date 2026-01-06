import path from "path";

const getdatauri = (file) => {
  return {
    content: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    filename: file.originalname,
  };
};

export default getdatauri;
