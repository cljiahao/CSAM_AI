import React, { useEffect, useState } from "react";
import { InfoBar, ImageHolder, Gallery } from "./layout";

const API = process.env.REACT_APP_API;
const initialState = {
  error: false,
  main_image: { src: null, alt: null },
};
const initialData = {
  directory: null,
  plate_no: null,
  ng_chips: null,
  chip_type: null,
};
const initialInfo = {
  no_of_chips: 0,
  no_of_batches: 0,
  pred_ng: 0,
  real_ng: 0,
};
const initialFocus = {
  img_shape: { width: 0, height: 0 },
  state: false,
  x: 0,
  y: 0,
  scale: 1,
};
let lot_no = "";

export default function App() {
  const [state, setState] = useState(initialState);
  const [info, setInfo] = useState(initialInfo);
  const [data, setData] = useState(initialData);
  const [focus, setFocus] = useState(initialFocus);
  const [array, setArray] = useState({});

  useEffect(() => {
    const load = () => {
      if (!state.error && lot_no) {
        insertDB(
          lot_no,
          data.plate_no,
          array,
          info.no_of_batches,
          info.no_of_chips,
          info.pred_ng,
          info.real_ng,
          data.directory,
          data.chip_type
        );
      }
    };
    window.addEventListener("beforeunload", load);
    return () => {
      window.removeEventListener("beforeunload", load);
    };
  }, [array]);

  function initialize() {
    if (!state.error && lot_no) {
      insertDB(
        lot_no,
        data.plate_no,
        array,
        info.no_of_batches,
        info.no_of_chips,
        info.pred_ng,
        info.real_ng,
        data.directory,
        data.chip_type
      );
    }
    if (lot_no === "" || lot_no === null || state.error)
      lot_no = prompt("Please scan or input Lot Number", "");
    setInfo(initialInfo);
    setState(initialState);
    setData(initialData);
    setFocus(initialFocus);
    setArray({});
  }

  function dataProcess(file, json) {
    const plate_no = json.plate_no;
    const ng_chips = json.ng_chips;
    const img_shape = json.img_shape;
    const no_of_batches = json.no_of_batches;
    const no_of_chips = json.no_of_chips;
    const ng_count = json.ng_count;
    const directory = json.directory;
    const chip_type = json.chip_type;

    let real_ng = 0;
    const array = {}

    Object.keys(ng_chips).map((key, index) => {
      return (ng_chips[key] = Object.assign(
        {},
        ...json.ng_chips[key].map((filename) => {
          const img_name = filename.split(".")[0];
          const [ng_g, batch, id, x, y] = img_name.split("_");
          const fname = filename;
          let color = null;
          let marker_radius = null;
          let border = null;
          if (ng_g === "1") {
            color = "yellow";
            marker_radius = 1;
            border = "2px solid red";
            real_ng += 1;
            array[fname] = fname
          }
          return { [id]: { ng_g, x, y, color, fname, marker_radius, border } };
        })
      ));
    });
    setArray({ ...array })
    setState({
      ...state,
      error: false,
      main_image: {
        src: `${API}${directory.split("backend")[1]}/Original/${file.name}`,
        alt: file.name,
      },
    });
    setInfo({
      no_of_batches: no_of_batches,
      no_of_chips: no_of_chips,
      pred_ng: ng_count,
      real_ng: real_ng,
    });
    setFocus({
      ...focus,
      img_shape: { width: img_shape[0], height: img_shape[1] },
    });
    setData({
      directory: directory,
      plate_no: plate_no,
      ng_chips: ng_chips,
      chip_type: chip_type,
    });
    if (json.plate_no.slice(0, 3)[0].toLowerCase() === "end" || lot_no === null)
      lot_no = "";
  }

  const errorHandling = async (file, res) => {
    if (res.status === "404") {
      setState({
        ...state,
        error: true,
        main_image: {
          src: "Error/Error_Lot_Num.png",
          alt: "Error_Lot_Num.png",
        },
      });
    } else if (res.status === "400") {
      setState({
        ...state,
        error: true,
        main_image: { src: "Error/Error.png", alt: "Error.png" },
      });
    } else {
      const json = await res.json();

      dataProcess(file, json);
    }
  };

  const loadImage = async (e) => {
    e.preventDefault();
    initialize();

    const file = e.target.files[0];
    if (file) {
      setState({
        ...state,
        main_image: { src: "Error/Loading.gif", alt: "Loading.gif" },
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lot_no", lot_no);

      const res = await fetch(`${API}/upload_file`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      errorHandling(file, res);
    }
  };

  const insertDB = async (
    lot_no,
    plate_no,
    actual,
    no_of_batches,
    no_of_chips,
    pred_ng,
    real_ng,
    directory,
    chip_type
  ) => {
    const data = {
      lot_no: lot_no,
      plate_no: plate_no,
      actual: Object.values(actual),
      no_of_batches: no_of_batches,
      no_of_chips: no_of_chips,
      pred_ng: pred_ng,
      real_ng: real_ng,
      directory: directory,
      chip_type: chip_type,
    };

    await fetch(`${API}/insert_db`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  return (
    <main className="main">
      <ImageHolder
        main_image={state.main_image}
        ng_chips={data.ng_chips}
        focus={focus}
        setFocus={setFocus}
      />
      <div className="main-side">
        <InfoBar
          upload={loadImage}
          info={info}
          lot_no={lot_no}
          filename={data.plate_no}
        />
        <Gallery
          array={array}
          info={info}
          data={data}
          focus={focus}
          setArray={setArray}
          setInfo={setInfo}
          setData={setData}
          setFocus={setFocus}
        />
      </div>
    </main>
  );
}
