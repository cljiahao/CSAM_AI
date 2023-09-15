import React, { useEffect, useState } from "react";
import { InfoBar, ImageHolder, Gallery } from "./Layout";

const API = process.env.REACT_APP_API;
const initialState = {
  error: false,
  mainImage: { src: null, alt: null },
};
const initialData = {
  baseUrl: null,
  ngChips: null,
  directory: null,
  chipType: null,
};
const initialInfo = {
  noOfChips: 0,
  ngCounts: 0,
  actual: 0,
};
const initialFocus = {
  imageSize: { width: 0, height: 0 },
  state: false,
  x: 0,
  y: 0,
  scale: 1,
};
let lotNumber = "";

export default function App() {
  const [state, setState] = useState(initialState);
  const [info, setInfo] = useState(initialInfo);
  const [data, setData] = useState(initialData);
  const [focus, setFocus] = useState(initialFocus);
  const [array, setArray] = useState({});

  useEffect(() => {
    const load = () => {
      if (!state.error && lotNumber) {
        insertDB(
          lotNumber,
          array,
          info.noOfChips,
          info.ngCounts,
          info.actual,
          data.directory,
          data.chipType
        );
      }
    };
    window.addEventListener("beforeunload", load);
    return () => {
      window.removeEventListener("beforeunload", load);
    };
  }, [array]);

  function initialize() {
    if (!state.error && lotNumber) {
      insertDB(
        lotNumber,
        array,
        info.noOfChips,
        info.ngCounts,
        info.actual,
        data.directory,
        data.chipType
      );
    }
    if (lotNumber === "" || lotNumber === null || state.error)
      lotNumber = prompt("Please scan or input Lot Number", "");
    setInfo(initialInfo);
    setState(initialState);
    setData(initialData);
    setFocus(initialFocus);
    setArray({});
  }

  function errorHandling(file, json) {
    if (json.error === true)
      setState({
        ...state,
        error: true,
        mainImage: { src: "Error/Error.png", alt: "Error.png" },
      });
    else if (json.LotNum === true)
      setState({
        ...state,
        error: true,
        mainImage: { src: "Error/LotNum.png", alt: "LotNum.png" },
      });
    else {
      const baseUrl = json.directory.split("build")[1];
      const directory = json.directory;
      const ngChips = json.ng;
      const chipType = json.chipType;
      Object.keys(ngChips).map((key, index) => {
        return (ngChips[key] = Object.assign(
          {},
          ...json.ng[key].map((imgFile) => {
            const img = imgFile.split(".")[0];
            const [id, x, y] = img.split("_").slice(-3);
            const filename = imgFile;
            const color = null;
            const markerRadius = null;
            return { [id]: { x, y, color, filename, markerRadius } };
          })
        ));
      });
      setState({
        ...state,
        error: false,
        mainImage: { src: baseUrl + "/Original/" + file.name, alt: file.name },
      });
      setInfo({ noOfChips: json.noOfChips, ngCounts: json.ngCount, actual: 0 });
      setFocus({
        ...focus,
        imageSize: { width: json.size[0], height: json.size[1] },
      });
      setData({ baseUrl, ngChips, directory, chipType });
      if (
        json.filename.slice(0, 3)[0].toLowerCase() === "end" ||
        lotNumber === null
      )
        lotNumber = "";
    }
  }

  const loadImage = async (e) => {
    e.preventDefault();
    initialize();

    const file = e.target.files[0];
    if (file) {
      setState({
        ...state,
        mainImage: { src: "Error/loading.gif", alt: "loading.gif" },
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("lotNumber", lotNumber);

      const res = await fetch(`${API}/uploadfile`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const json = await res.json();

      errorHandling(file, json);
    }
  };

  const insertDB = async (lot, arr, chipno, ngcnt, act, dir, type) => {
    const dbForm = new FormData();
    dbForm.append("lot_no", lot);
    dbForm.append("actual", Object.values(arr));
    dbForm.append("no_of_chips", chipno);
    dbForm.append("pred_ng", ngcnt);
    dbForm.append("real_ng", act);
    dbForm.append("directory", dir);
    dbForm.append("chip_type", type);

    await fetch(`${API}/insertDB`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: dbForm,
    });
  };

  return (
    <main className="main">
      <ImageHolder
        mainImage={state.mainImage}
        ngChips={data.ngChips}
        focus={focus}
        setFocus={setFocus}
      />
      <div className="main-side">
        <InfoBar
          upload={loadImage}
          info={info}
          lotNumber={lotNumber}
          filename={state.mainImage.alt}
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
