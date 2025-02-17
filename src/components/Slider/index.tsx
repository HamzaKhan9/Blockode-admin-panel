import { createUseStyles } from "react-jss";
import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";

import { MyTheme } from "../../types/theme";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const useStyles = createUseStyles((theme: MyTheme) => ({
  customDots: {
    height: "10px",
    padding: "2px",
    background: theme.colorPrimary,
    border: `1px solid ${theme.colorPrimary}`,
  },

  nextButton: {
    position: "absolute",
    width: "30px",
    height: "30px",
    border: `2px solid ${theme.colorPrimary}`,
    borderRadius: "50%",
    top: -45,
    right: 40,
    cursor: "pointer",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      opacity: 0.6,
    },
  },
  prevButton: {
    position: "absolute",
    width: "30px",
    height: "30px",
    border: `2px solid ${theme.colorPrimary}`,
    borderRadius: "50%",
    top: -45,
    right: 90,
    cursor: "pointer",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      opacity: 0.6,
    },
  },

  arror: {
    color: theme.colorPrimary,
  },
}));

interface SliderProps {
  children: React.ReactNode;
}

const CustomSlider = ({ children }: SliderProps) => {
  const classes = useStyles();

  const numChildren = React.Children.count(children);

  const [activeSlide, setActiveSlide] = useState(1);
  const [slideToShow, setSlideToShow] = useState(
    numChildren > 2 ? 3 : numChildren === 2 ? 2 : 1
  );

  const sliderRef = useRef(null);

  function Next(props: any) {
    const { onClick } = props;
    return (
      <div className={classes.nextButton} onClick={onClick}>
        <ArrowRightOutlined className={classes.arror} />
      </div>
    );
  }

  function Previous(props: any) {
    const { onClick } = props;
    return (
      <div className={classes.prevButton} onClick={onClick}>
        <ArrowLeftOutlined className={classes.arror} />
      </div>
    );
  }

  const setSlides = () => {
    if (window.innerWidth < 1200 && window.innerWidth > 1124) {
      if (numChildren > 2) {
        setSlideToShow(3);
      } else if (numChildren === 2) {
        setSlideToShow(2);
      } else if (numChildren === 1) {
        setSlideToShow(1);
      }
    } else if (window.innerWidth < 1124 && window.innerWidth > 800) {
      if (numChildren >= 2) {
        setSlideToShow(2);
      } else if (numChildren === 1) {
        setSlideToShow(1);
      }
    } else if (window.innerWidth <= 800) {
      setSlideToShow(1);
    }
  };

  useEffect(() => {
    setSlides();
    window.addEventListener("resize", () => {
      setSlides();
    });
  }, [slideToShow]);
  const settings = {
    customPaging: function (i: number) {
      return (
        <div
          className={classes.customDots}
          style={{
            width: i === activeSlide ? "30px" : "10px",
          }}
        ></div>
      );
    },
    dots: true,
    infinite: true,
    arrows: true,
    speed: 300,
    slidesToShow: slideToShow, // Set the number of slides to show
    slidesToScroll: 2,
    afterChange: (currentSlide: any) => {
      setActiveSlide(currentSlide);
    },

    nextArrow: <Next />,
    prevArrow: <Previous />,
  };

  return (
    <div>
      <Slider ref={sliderRef} {...settings}>
        {children}
      </Slider>
    </div>
  );
};

export default CustomSlider;
