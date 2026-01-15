import React from "react";
import "../App.css";
import SimpleForm from "../components/form";

export default function Category() {
  return (
    <>
      <div className="parallax-layer">
        <img
          className="parallax-layer-i"
          src="imgs/library.jpg"
          alt="Bookshelf"
        />
      </div>
      <SimpleForm/>
    </>
  );
}
