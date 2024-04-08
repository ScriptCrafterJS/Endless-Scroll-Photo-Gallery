"use strict";
const imagesContainer = document.querySelector(".images_container");
let figure = "";
const body = document.querySelector("body");
const dimensions = [180, 250, 280, 320, 350];

//-------------------------[Handling Infinite Scrolling]
// a function to request an image from the "picsum" API.
function getImageID(imgURL) {
  const imgURLdata = imgURL?.split("/");
  return imgURLdata[imgURLdata.indexOf("id") + 1];
}

// a function that takes image id and return information about the image: author,
async function getImageData(imgID) {
  try {
    const res = await fetch(`https://picsum.photos/id/${imgID}/info`);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching image data:", error);
  }
}

function getRandomHeight() {
  const randomIndex = Math.trunc(Math.random() * 5);
  return dimensions[randomIndex];
}

async function getImageURL() {
  try {
    const randomHeight = getRandomHeight();
    const res = await fetch(`https://picsum.photos/200/${randomHeight}`);
    return res.url;
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  }
}

async function appendImages(numberOfImages) {
  for (let i = 0; i < numberOfImages; i++) {
    const imageUrl = await getImageURL();
    const imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    imageElement.classList.add("image-item");
    imagesContainer.appendChild(imageElement);
  }
}

// a function to display some images for the first time the user enters the page.
async function initialDisplay(numberOfImages) {
  await appendImages(numberOfImages);
}
// a function to display each time the user see the last image (last element => see more!)/
const displayInfinite = function () {
  async function displayDefaultAndObserve(numberOfImages) {
    await appendImages(numberOfImages);
    observer.observe(imagesContainer.lastElementChild); //each time we bring new images i want to observe the last element of those new ones so i could get more
  }

  function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      //if we are hitting the last element with our viewport or not
      if (entry.isIntersecting) {
        displayDefaultAndObserve(5);
      }
    });
  }

  const options = {
    root: null,
  };

  const observer = new IntersectionObserver(handleIntersection, options);
  observer.observe(imagesContainer);
};
//Display some images and then keep showing
initialDisplay(10);
displayInfinite();
//-------------------------[Handling Image Card Preview]
//* ive forgot to undo the comments and save the end result of "infinite scrolling" part in my commit to that file, i will use Amend flag in git to do it, instead of making a whole commit for it.

//* i want when the user press on a photo , to get its id from the e.target.url and then get the id of that image from the url and then bring the phot information.

//handle clicking the container of the images and preview the image
imagesContainer.addEventListener("click", (e) => {
  if (body.firstElementChild.classList.contains("image-card")) {
    body.removeChild(body.firstElementChild);
  } else {
    previewImage(e);
  }
});
//handle clicking outside the container to close the preview
body.addEventListener("click", function (e) {
  if (body.firstElementChild.classList.contains("image-card")) {
    if (e.target.classList.contains("image-card")) {
      body.removeChild(body.firstElementChild);
      body.classList.remove("shadowing");
    }
  }
});

//handle clicking escape key to close the preview
document.addEventListener("keydown", function (e) {
  if (
    e.key === "Escape" &&
    body.firstElementChild.classList.contains("image-card")
  ) {
    body.removeChild(body.firstElementChild);
    body.classList.remove("shadowing");
  }
});

// a function that can create an image card and preview it
let previewedImageURL = "";
async function previewImage(e) {
  const imageURL = e.target.src;
  const id = await getImageID(imageURL);
  const imageDetails = await getImageData(id);
  previewedImageURL = imageDetails.download_url;
  displayCard(imageURL, imageDetails);
  downloadButtonListener();
}
function displayCard(imageURL, imageDetails) {
  const imgCardHTML = `
  <article class="image-card">
      <figure class="figure">
          <img src="${imageURL}" alt="" />
          <p class="image-card__author">Author:<br/> ${imageDetails.author}</p>
          <button class="image-card__download-btn">Download</button>
      </figure>
  </article>
  `;
  body.classList.add("shadowing");
  body.insertAdjacentHTML("afterbegin", imgCardHTML);
}
function downloadButtonListener() {
  //[DOWNLOAD IMAGE]
  const downloadButton = document.querySelector(".image-card__download-btn");
  downloadButton.addEventListener("click", async function () {
    const a = document.createElement("a");
    a.style.display = "none";
    try {
      //start the loading...
      processLoading();
      // fetch the image data as a blob
      const response = await fetch(previewedImageURL);
      const blob = await response.blob();

      //here we create a DOMString for the img url
      a.href = URL.createObjectURL(blob);

      a.download = "image.jpg"; //this string is the name of the image when downloaded

      document.body.appendChild(a);
      // trigger a click to start the download
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("error when downloading the image:", error);
    } finally {
      //end the loading
      processLoading();
    }
  });
}
function processLoading() {
  if (!document.querySelector(".loading")) {
    figure = document.querySelector(".figure");
    const loadingHTML = `
    <div class="loading">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
    </div>
  `;
    figure.insertAdjacentHTML("beforeend", loadingHTML);
    document.querySelector(".loading").style.display = "block";
  } else {
    document.querySelector(".loading").style.display = "none";
  }
}
