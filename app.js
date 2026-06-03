(function () {
  const albums = window.LEEO_ALBUMS || [];
  const main = document.querySelector("main");
  const albumView = document.getElementById("album-view");
  const closeButton = document.getElementById("album-close");
  const photoGrid = document.getElementById("photo-grid");
  const albumTitle = document.getElementById("album-title");
  const albumCategory = document.getElementById("album-category");
  const albumCount = document.getElementById("album-count");
  const loadMore = document.getElementById("load-more");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxIndex = document.getElementById("lightbox-index");

  let activeAlbum = null;
  let activeIndex = 0;
  let visiblePhotoCount = 0;
  const batchSize = 24;

  function albumDateLabel(title) {
    const match = title.match(/^(\d{2,4})[-_ ](.+)$/);
    if (!match) return title;
    const year = match[1].length === 2 ? `20${match[1]}` : match[1];
    return `${year} · ${match[2].replaceAll("-", " ")}`;
  }

  function renderAlbums(category, targetId) {
    const target = document.getElementById(targetId);
    const filtered = albums.filter((album) => album.category === category);
    target.innerHTML = filtered
      .map(
        (album) => `
          <button class="album-card" type="button" data-slug="${album.slug}">
            <span class="album-cover">
              <img src="${album.cover}" alt="${album.title} 婚礼作品封面" loading="lazy">
            </span>
            <span class="album-info">
              <span>
                <span class="album-name">${albumDateLabel(album.title)}</span>
                <span class="album-meta">${album.categoryLabel}</span>
              </span>
              <span class="album-meta">${album.count} Photos</span>
            </span>
          </button>
        `
      )
      .join("");
  }

  function setHash(slug) {
    history.pushState(null, "", slug ? `#album=${slug}` : "#top");
  }

  function openAlbum(album, updateHash) {
    activeAlbum = album;
    activeIndex = 0;
    visiblePhotoCount = Math.min(batchSize, album.images.length);
    albumTitle.textContent = albumDateLabel(album.title);
    albumCategory.textContent = album.categoryLabel;
    albumCount.textContent = `${album.count} Photos`;
    renderPhotos();
    document.body.classList.add("is-viewing-album");
    main.setAttribute("hidden", "");
    albumView.removeAttribute("hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
    if (updateHash) setHash(album.slug);
  }

  function renderPhotos() {
    if (!activeAlbum) return;
    photoGrid.innerHTML = activeAlbum.images
      .slice(0, visiblePhotoCount)
      .map(
        (src, index) => `
          <button class="photo-button" type="button" data-index="${index}">
            <img src="${src}" alt="${activeAlbum.title} 婚礼作品 ${index + 1}" loading="lazy">
          </button>
        `
      )
      .join("");
    loadMore.hidden = visiblePhotoCount >= activeAlbum.images.length;
  }

  function closeAlbum() {
    activeAlbum = null;
    visiblePhotoCount = 0;
    document.body.classList.remove("is-viewing-album");
    albumView.setAttribute("hidden", "");
    main.removeAttribute("hidden");
    setHash("");
  }

  function openLightbox(index) {
    if (!activeAlbum) return;
    activeIndex = index;
    lightboxImage.src = activeAlbum.images[activeIndex];
    lightboxImage.alt = `${activeAlbum.title} 婚礼作品 ${activeIndex + 1}`;
    lightboxIndex.textContent = `${activeIndex + 1} / ${activeAlbum.images.length}`;
    lightbox.removeAttribute("hidden");
  }

  function closeLightbox() {
    lightbox.setAttribute("hidden", "");
    lightboxImage.removeAttribute("src");
  }

  function moveLightbox(delta) {
    if (!activeAlbum) return;
    activeIndex = (activeIndex + delta + activeAlbum.images.length) % activeAlbum.images.length;
    openLightbox(activeIndex);
  }

  renderAlbums("documentary", "documentary-albums");
  renderAlbums("editorial", "editorial-albums");

  document.addEventListener("click", (event) => {
    const albumButton = event.target.closest(".album-card");
    if (albumButton) {
      const album = albums.find((item) => item.slug === albumButton.dataset.slug);
      if (album) openAlbum(album, true);
      return;
    }

    const photoButton = event.target.closest(".photo-button");
    if (photoButton) {
      openLightbox(Number(photoButton.dataset.index));
    }
  });

  closeButton.addEventListener("click", closeAlbum);
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => moveLightbox(-1));
  lightboxNext.addEventListener("click", () => moveLightbox(1));
  loadMore.addEventListener("click", () => {
    if (!activeAlbum) return;
    visiblePhotoCount = Math.min(visiblePhotoCount + batchSize, activeAlbum.images.length);
    renderPhotos();
  });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  window.addEventListener("popstate", () => {
    const slug = location.hash.replace("#album=", "");
    const album = albums.find((item) => item.slug === slug);
    if (album) openAlbum(album, false);
    else closeAlbum();
  });

  const initialSlug = location.hash.startsWith("#album=")
    ? location.hash.replace("#album=", "")
    : "";
  const initialAlbum = albums.find((item) => item.slug === initialSlug);
  if (initialAlbum) openAlbum(initialAlbum, false);
})();
