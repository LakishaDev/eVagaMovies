/**
 * Utility funkcije za formatiranje i obradu filmskih podataka
 */

/**
 * Čisti naziv filma od tehničkih detalja i formatira ga za prikaz
 */
export function cleanMovieTitle(title) {
  if (!title) return "";

  let cleaned = title;

  // Ukloni numeraciju na početku (1. Spider Man → Spider Man)
  cleaned = cleaned.replace(/^\d+\.\s*/, "");

  // Zameni tačke i donje crte sa razmacima
  cleaned = cleaned.replace(/\./g, " ");
  cleaned = cleaned.replace(/_/g, " ");

  // Ukloni tehničke detalje u uglatim zagradama
  cleaned = cleaned.replace(/\[.*?\]/g, "");

  // Ukloni tehničke specifikacije (1080p, 2160p, 720p, x264, x265, H264, AAC, etc.)
  const technicalPatterns = [
    /\b\d{3,4}p\b/gi, // 1080p, 2160p, 720p
    /\b(4K|UHD|FHD|HD)\b/gi, // 4K, UHD, FHD, HD
    /\bx26[45]\b/gi, // x264, x265
    /\bH\.?26[45]\b/gi, // H264, H.264, H265, H.265
    /\b(AAC|DTS|AC3)[\d.]*\b/gi, // AAC5.1, DTS, AC3
    /\b(BluRay|BrRip|BRRip|WEBRip|WEB-DL|DVDRip|HDTV)\b/gi, // Source
    /\b(REMASTERED|REPACK|EXTENDED|IMAX|CODA\.CUT)\b/gi, // Editions
    /\b\d+bit\b/gi, // 10bit, 8bit
    /\bHDR\b/gi, // HDR
    /-\s*$/, // Trailing dash
  ];

  technicalPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  // Ukloni višestruke razmake i sređi
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Ukloni trailing godine u zagradama ako postoje duplirane (npr. "Interstellar 2014 (2014)")
  cleaned = cleaned.replace(/\s+\d{4}\s*\(\d{4}\)/, (match) => {
    const year = match.match(/\d{4}/)[0];
    return ` (${year})`;
  });

  return cleaned;
}

/**
 * Ekstraktuje godinu iz naziva ili koristi movie.year
 */
export function getMovieYear(movie) {
  if (movie.year) return movie.year;

  // Pokušaj da nađeš godinu u nazivu
  const match = movie.title?.match(/\((\d{4})\)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Formatira veličinu fajla u čitljiv format
 */
export function formatFileSize(bytes) {
  if (!bytes) return "N/A";
  const gb = (bytes / 1024 ** 3).toFixed(2);
  return `${gb} GB`;
}

/**
 * Sortira filmove po kriterijumu
 */
export function sortMovies(movies, sortBy = "title-asc") {
  const sorted = [...movies];

  switch (sortBy) {
    case "title-asc":
      return sorted.sort((a, b) => {
        const titleA = cleanMovieTitle(a.title).toLowerCase();
        const titleB = cleanMovieTitle(b.title).toLowerCase();
        return titleA.localeCompare(titleB);
      });

    case "title-desc":
      return sorted.sort((a, b) => {
        const titleA = cleanMovieTitle(a.title).toLowerCase();
        const titleB = cleanMovieTitle(b.title).toLowerCase();
        return titleB.localeCompare(titleA);
      });

    case "year-desc":
      return sorted.sort((a, b) => {
        const yearA = getMovieYear(a) || 0;
        const yearB = getMovieYear(b) || 0;
        return yearB - yearA;
      });

    case "year-asc":
      return sorted.sort((a, b) => {
        const yearA = getMovieYear(a) || 0;
        const yearB = getMovieYear(b) || 0;
        return yearA - yearB;
      });

    case "size-desc":
      return sorted.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));

    case "size-asc":
      return sorted.sort((a, b) => (a.file_size || 0) - (b.file_size || 0));

    default:
      return sorted;
  }
}

/**
 * Ekstraktuje deo serije iz naziva (npr. "Part II", "Vol. 2")
 */
export function extractSeriesPart(title) {
  const patterns = [
    /Part\s+(I{1,3}|IV|V)/i, // Part II, Part III
    /Vol\.?\s*\d+/i, // Vol. 2, Vol 2
    /\b\d+\b/, // samo broj
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }

  return null;
}
