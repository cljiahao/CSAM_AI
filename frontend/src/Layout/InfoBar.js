import React from "react";
import Input from "../Components/Input";

export default function InfoBar({ upload, info, lot_no, filename }) {
  return (
    <aside className="infobar">
      {/* <Button css="infobar-menu" text={<i className='bx bx-menu'></i>}/> */}
      <ul className="infobar-ul">
        <li className="infobar-li">
          Lot Number:
          <p className="inforbar-li-p">{lot_no}</p>
        </li>
        <li className="infobar-li">
          Plate Number:
          <p className="inforbar-li-p">{filename}</p>
        </li>
        <li className="infobar-li">
          NG chips:
          <p className="inforbar-li-p">{info.pred_ng} pcs</p>
        </li>
        <li className="infobar-li">
          Actual NG:
          <p className="inforbar-li-p">{info.real_ng} pcs</p>
        </li>
      </ul>
      <Input
        css="infobar-upload"
        text="Upload Image"
        onClick={(event) => {
          event.currentTarget.value = "";
        }}
        onChange={upload}
      />
    </aside>
  );
}
