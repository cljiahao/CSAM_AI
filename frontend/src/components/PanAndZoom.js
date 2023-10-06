import React, { useEffect, useRef, useState } from "react";

const initialDisplay = {
  oldX: 0,
  oldY: 0,
  x: 0,
  y: 0,
  scale: 1,
  width: 0,
  height: 0,
};

const PanAndZoom = ({ main_image, ng_chips, focus, setFocus }) => {
  const [isPanning, setPanning] = useState(false);
  const [container, setContainer] = useState();
  const [display, setDisplay] = useState(initialDisplay);
  const containerRef = useRef();
  useEffect(() => {
    if (focus.state === true) {
      const rect = containerRef.current.getBoundingClientRect();
      setDisplay({
        ...display,
        x:
          (rect.width / 2 - (focus.x * rect.width) / container.width) *
          focus.scale,
        y:
          (rect.height / 2 - (focus.y * rect.height) / container.height) *
          focus.scale,
        scale: focus.scale,
      });
    } else {
      setDisplay({ ...display, x: focus.x, y: focus.y, scale: focus.scale });
    }
  }, [focus]);

  useEffect(() => {
    const mouseup = () => {
      setPanning(false);
    };
    const mousemove = (event) => {
      if (isPanning) {
        setDisplay({
          ...display,
          x: display.x + event.clientX - display.oldX,
          y: display.y + event.clientY - display.oldY,
          oldX: event.clientX,
          oldY: event.clientY,
        });
      }
    };
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mousemove", mousemove);
    return () => {
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mousemove", mousemove);
    };
  });

  const onLoad = (e) => {
    setContainer({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
    const rect = containerRef.current.getBoundingClientRect();
    setDisplay({
      oldX: 0,
      oldY: 0,
      x: 0,
      y: 0,
      scale: 1,
      width: rect.width,
      height: rect.height,
    });
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    setPanning(true);
    setDisplay({
      ...display,
      oldX: e.clientX,
      oldY: e.clientY,
    });
  };

  const onWheel = (e) => {
    if (e.deltaY) {
      const sign = Math.sign(e.deltaY) / 10;
      const scale = 1 - sign;
      const rect = containerRef.current.getBoundingClientRect();
      if (display.scale >= 1) {
        setDisplay({
          ...display,
          x: display.x * scale - (rect.width / 2 - e.clientX + rect.x) * sign,
          y:
            display.y * scale -
            ((container.height * rect.width) / container.width / 2 -
              e.clientY +
              rect.y) *
              sign,
          scale: display.scale * scale,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setDisplay({ ...display, x: 0, y: 0, scale: 1 });
      }
    }
  };

  const resetFocus = () => {
    setFocus({ ...focus, state: false, x: 0, y: 0, scale: 1 });
  };

  const ChipMarker = () => (
    <svg
      style={{ position: "absolute" }}
      width={display.width}
      height={display.height}
    >
      <circle
        cx="500"
        cy="500"
        r={null}
        stroke={null}
        strokeWidth="2"
        fillOpacity="0.1"
      />
      {Object.keys(ng_chips).map((key, index) => {
        return Object.keys(ng_chips[key]).map((k, i) => {
          const { x, y, color, markerRadius } = ng_chips[key][k];
          const cx = (x * display.width) / focus.img_shape.width;
          const cy = (y * display.height) / focus.img_shape.height;
          return (
            <circle
              key={k}
              cx={cx}
              cy={cy}
              r={markerRadius}
              stroke={color}
              strokeWidth="2"
              fillOpacity="0"
            />
          );
        });
      })}
    </svg>
  );

  return (
    <div
      className=""
      ref={containerRef}
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      onDoubleClick={resetFocus}
    >
      <div
        style={{
          transform: `translate(${display.x}px, ${display.y}px) scale(${display.scale})`,
        }}
      >
        {ng_chips && ChipMarker()}
        <img
          className="container mx auto"
          alt={main_image.alt}
          src={main_image.src}
          onLoad={onLoad}
        />
      </div>
    </div>
  );
};

export default PanAndZoom;
