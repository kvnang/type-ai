import { Form } from "@/components/Form";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <section className="container my-10">
        <h1 className="text-3xl mb-12 text-center font-semibold">Type AI</h1>
        <Form />
      </section>
    </main>
  );
}
