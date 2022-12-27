import moment from "moment-timezone";
import fetch from "node-fetch";

(async () => {
  const response = await fetch("https://www.gov.uk/bank-holidays.json");
  const data = await response.json();
  const holidays = data["england-and-wales"].events.map((event) => event.date);

  const config = {
    timezone: "Europe/London", // other zones --> https://github.com/moment/moment-timezone/blob/develop/data/packed/latest.json
    closeHour: 16, // 24h (mil)
    openHour: 8,
    days: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ], // corresponds with moment day format 0 - 6
    type: "public",
  };

  const checkHoliday = (date) => {
    if (holidays.includes(date.format("YYYY-MM-DD"))) {
      return true;
    } else {
      return false;
    }
  };

  const getDeliveryDay = (date) => {
    let deliveryDay = moment(date).add(1, "days");
    // add a day when, sat, sun or holiday
    
    while (
      parseInt(moment(deliveryDay).format("e")) == 6 ||
      parseInt(moment(deliveryDay).format("e")) == 0 ||
      checkHoliday(moment(deliveryDay.format("YYYY-MM-DD")))
    ) {
      deliveryDay = moment(deliveryDay.format("YYYY-MM-DD")).add(1, "days");
    }

    return new Date(
      moment(deliveryDay.format("YYYY-MM-DD"))
    ).toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const checkValidity = (date) => {
    const today = parseInt(moment(date).format("e"));
    const timeH = moment(date).format("H");

    // add a day when sat, sun, past 16h or holiday
    if (
      today == 6 ||
      today == 0 ||
      // hd.isHoliday(new Date(date.format('YYYY-MM-DD'))) && hd.isHoliday(new Date(date.format('YYYY-MM-DD')))[0].type == 'public'){
      checkHoliday(date)
    ) {
      date.add(1, "days");
      setTimeout(() => {
        checkValidity(date);
      }, 5000);
    } else {
      // console.log(date);
      const currentTime = moment().tz(config.timezone);
      const currentTimeH = date.format("H");
      const currentTimeM = date.format("mm");

      //// Checks if office hours are open or closed
      // If Time is between open and closing
      if (currentTimeH >= config.openHour && currentTimeH < config.closeHour) {
        const closeTime = moment(date.format("YYYY-MM-DD")).add(
          config.closeHour,
          "hours"
        );
        const diffM = closeTime.diff(
          moment(date.format("YYYY-MM-DD"))
            .add(currentTimeH, "hours")
            .add(currentTimeM, "minutes"),
          "minutes"
        );
        console.log(getDeliveryDay(date))
        // console.log(date)
        setTimeout(() => {
          runClock();
        }, 10000);
        // If Time is after closing
      } else if (currentTimeH >= config.closeHour) {
        // Add one day delivery if office hours are closed
        // console.log(date);
        const day = getDeliveryDay(new Date(getDeliveryDay(date)));
        // console.log(new Date(moment(new Date(day)).add(1, "days")).toLocaleDateString("en-us", {
        //   weekday: "long",
        //   year: "numeric",
        //   month: "short",
        //   day: "numeric",
        // }));
        console.log(day)
        // If time is before opening
      } else if (currentTimeH < config.openHour) {
        const day = getDeliveryDay(date);
        console.log(day);
      }
    }
  };
  const runClock = () => {
    const currentTime = moment().tz(config.timezone);
    const cur = moment(new Date(2022, 11, 30, 16, 0, 0))

    checkValidity(cur);
  };
  runClock();
})();
