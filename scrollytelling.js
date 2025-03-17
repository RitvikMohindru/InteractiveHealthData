document.addEventListener("DOMContentLoaded", function () {
  const scrolly = document.querySelector("#scrolly");
  const article = scrolly.querySelector("article");
  const steps = article.querySelectorAll(".step");

  const handleScroll = () => {
    const scrollyTop = scrolly.getBoundingClientRect().top;
    const scrollyBottom = scrolly.getBoundingClientRect().bottom;

    steps.forEach((step) => {
      const stepTop = step.getBoundingClientRect().top;
      const stepBottom = step.getBoundingClientRect().bottom;

      if (
        stepTop < window.innerHeight * 0.5 &&
        stepBottom > window.innerHeight * 0.1
      ) {
        step.classList.add("is-active");
      } else {
        step.classList.remove("is-active");
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();
});
