"use strict";
const imagesContainer = document.querySelector(".images_container");
let figure = "";
const body = document.querySelector("body");
const dimensions = [180, 270, 320, 360, 400];

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

async function getImages(numberOfImages) {
  try {
    const randomPageNum = Math.trunc(Math.random() * 50 + 1);
    const res = await fetch(
      `https://picsum.photos/v2/list?page=${randomPageNum}&limit=${numberOfImages}`
    );
    const images = await res.json();
    return images;
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  }
}

function modifiedURL(image) {
  const imageUrlData = image.download_url.split("/");
  const imgHeight = getRandomHeight();
  const imgWidth = 200;
  imageUrlData[imageUrlData.indexOf("id") + 2] = imgHeight;
  imageUrlData[imageUrlData.indexOf("id") + 3] = imgWidth;
  return imageUrlData.join("/");
}
async function appendImages(numberOfImages) {
  const images = await getImages(numberOfImages);
  let imagesCounter = 0; //to track when all the images are loaded and then go for the infinite
  for (let i = 0; i < numberOfImages; i++) {
    const imageUrl = modifiedURL(images[i]);
    const imageElement = document.createElement("img");
    i;
    imageElement.src = imageUrl;
    imageElement.classList.add("image-item");
    imageElement.setAttribute("download_url", `${images[i].download_url}`);
    imageElement.setAttribute("author", `${images[i].author}`);
    imagesContainer.appendChild(imageElement);
    imageElement.addEventListener("load", function () {
      imagesCounter++;
      if (imagesCounter === numberOfImages) {
        displayInfinite();
      }
    });
  }
}

// a function to display each time the user see the last image (last element => see more!)/
const displayInfinite = function () {
  const options = {
    root: null, // means the viewport
  };

  const observer = new IntersectionObserver(handleIntersection, options);

  const lastImage = imagesContainer.lastElementChild;
  if (lastImage) {
    observer.observe(lastImage);
  }

  function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target); //!so the images wont appear two times, if going up and down.
        appendImages(10); //fetch more images
      }
    });
  }
};
//Display some images and then keep showing
appendImages(15);
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
  previewedImageURL = e.target.getAttribute("download_url");
  displayCard(e);
  downloadButtonListener();
}
function displayCard(e) {
  const imgCardHTML = `
  <article class="image-card">
      <figure class="figure">
          <img src="${e.target.src}" alt="" />
          <p class="image-card__author">Author:<br/> ${e.target.getAttribute(
            "author"
          )}</p>
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
      console.log(previewedImageURL);
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
