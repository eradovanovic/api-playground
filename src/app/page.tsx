import MswProvider from "@/mock/MswProvider";
import ApiPlayground from "./api-playground/ApiPlayground";

export default function Home() {
  return (
     <MswProvider>
      <ApiPlayground />
     </MswProvider>
  );
}
