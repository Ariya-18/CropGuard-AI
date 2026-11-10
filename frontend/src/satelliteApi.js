
import axios from "axios";

const API = "http://localhost:5000/api";

export async function getSatelliteImage(boundaryPoints, from, to) {
  const response = await axios.post(
    `${API}/satellite/image`,
    {
      boundaryPoints,
      from,
      to,
    },
    {
      responseType: "blob",
    }
  );

  return URL.createObjectURL(response.data);
}
