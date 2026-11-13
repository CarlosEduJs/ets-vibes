/**
 * License plates in game.sii are stored as `<markup>TEXT</align></margin>|country`.
 * With custom colors the markup draws a colored background image and colored text:
 *
 *   <color value=FF232323><margin left=-15><img src=/material/ui/white.mat xscale=stretch yscale=stretch><ret>
 *   <margin left=2><align hstyle=center vstyle=center><font xscale=1 yscale=1 ><color value=FFDB7A65>TEXT</align></margin>|belgium
 *
 * Colors are `AARRGGBB` hex (AA is always FF here).
 */

export interface PlateParts {
  text: string;
  country: string;
  /** `#rrggbb`; null when the plate uses the game's default look. */
  background: string | null;
  textColor: string | null;
}

export const DEFAULT_BACKGROUND = "#232323";
export const DEFAULT_TEXT_COLOR = "#db7a65";

const STYLED_RE =
  /^<color value=FF([0-9a-fA-F]{6})><margin left=-15><img src=\/material\/ui\/white\.mat xscale=stretch yscale=stretch><ret><margin left=2><align hstyle=center vstyle=center><font xscale=1 yscale=1 ><color value=FF([0-9a-fA-F]{6})>(.*)<\/align><\/margin>\|([^|]*)$/s;

export function parsePlate(raw: string): PlateParts {
  const styled = STYLED_RE.exec(raw);
  if (styled) {
    const [, bg = "", fg = "", text = "", country = ""] = styled;
    return {
      background: `#${bg.toLowerCase()}`,
      textColor: `#${fg.toLowerCase()}`,
      text,
      country,
    };
  }
  const sep = raw.lastIndexOf("|");
  const body = sep >= 0 ? raw.slice(0, sep) : raw;
  return {
    background: null,
    textColor: null,
    text: body.replace(/<[^>]*>/g, ""),
    country: sep >= 0 ? raw.slice(sep + 1) : "",
  };
}

function hex6(color: string): string {
  return color.replace("#", "").toUpperCase();
}

export function buildPlate({ text, country, background, textColor }: PlateParts): string {
  const suffix = country ? `|${country}` : "";
  if (background == null || textColor == null) {
    return `${text}${suffix}`;
  }
  return (
    `<color value=FF${hex6(background)}><margin left=-15>` +
    `<img src=/material/ui/white.mat xscale=stretch yscale=stretch><ret>` +
    `<margin left=2><align hstyle=center vstyle=center><font xscale=1 yscale=1 >` +
    `<color value=FF${hex6(textColor)}>${text}</align></margin>${suffix}`
  );
}

/** Returns an error message when the plate can't be written safely, otherwise null. */
export function validatePlateParts({ text, country }: PlateParts): string | null {
  if (!text.trim()) return "Plate text can't be empty.";
  if (/["\r\n<>|]/.test(text)) return "Plate text can't contain \" < > | or line breaks.";
  if (/["\r\n<>|\s]/.test(country)) return "Country must be a single word (e.g. spain).";
  return null;
}

/** Common plate country ids used by the game; the field still accepts any value. */
export const PLATE_COUNTRIES = [
  "austria",
  "belgium",
  "bulgaria",
  "croatia",
  "czech",
  "denmark",
  "estonia",
  "finland",
  "france",
  "germany",
  "greece",
  "hungary",
  "italy",
  "latvia",
  "lithuania",
  "luxembourg",
  "netherlands",
  "norway",
  "poland",
  "portugal",
  "romania",
  "slovakia",
  "spain",
  "sweden",
  "switzerland",
  "turkey",
  "uk",
];
