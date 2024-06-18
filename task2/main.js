let startTime;
let intervalId;

document.getElementById("container").addEventListener("click", (event) => {
  const targetId = event.target.id;
  const resultElement = document.getElementById("result");

  switch (targetId) {
    case "start":
      startTime = performance.now();
      resultElement.textContent = "Time duration: 0s";

      if (intervalId) {
        clearInterval(intervalId);
      }

      intervalId = setInterval(() => {
        const currentTime = performance.now();
        const duration = ((currentTime - startTime) / 1000).toFixed(4);
        resultElement.textContent = `Time duration: ${duration}s`;
      }, 100);
      break;
    case "end":
      if (startTime) {
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(4);
        resultElement.textContent = `Final duration: ${duration}s`;
        clearInterval(intervalId); // Stop updating the time
      } else {
        resultElement.textContent =
          'Click "start" first to start the timer.';
      }
      break;
    case "reset":
      startTime = null;
      clearInterval(intervalId);
      resultElement.textContent = "Time duration: 0s";
      break;
    default:
      break;
  }
});
