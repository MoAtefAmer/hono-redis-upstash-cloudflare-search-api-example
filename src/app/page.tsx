"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");

  const [searchResults,setSearchResults] = useState<{
    results: string[];
    duration: number;
  }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!input) return setSearchResults(undefined);

      const res = await fetch(`/api/search?q=${input}`);
      const data = await res.json();
      console.log('data :>> ', data);
      setSearchResults(data);


    };
    fetchData();
  }, [input]);

  return (
    <div>
      <input
      className="text-zinc-900"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        type="text"
      />
    </div>
  );
}
