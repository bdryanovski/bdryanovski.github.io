import React, { useState } from "react";

const copyToClipboard = (str) => {
  const { clipboard } = window.navigator;
  /*
   * fallback to older browsers (including Safari)
   * if clipboard API is not supported
   */
  if (!clipboard || typeof clipboard.writeText !== `function`) {
    const textarea = document.createElement(`textarea`);
    textarea.value = str;
    textarea.setAttribute(`readonly`, `true`);
    textarea.setAttribute(`contenteditable`, `true`);
    textarea.style.position = `absolute`;
    textarea.style.left = `-9999px`;
    document.body.appendChild(textarea);
    textarea.select();
    const range = document.createRange();
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    textarea.setSelectionRange(0, textarea.value.length);
    document.execCommand(`copy`);
    document.body.removeChild(textarea);

    return Promise.resolve(true);
  }

  return clipboard.writeText(str);
};

export const visuallyHidden = {
  // include `px` so we can use it with `sx`
  border: 0,
  clip: `rect(0, 0, 0, 0)`,
  height: `1px`,
  margin: `-1px`,
  overflow: `hidden`,
  padding: 0,
  position: `absolute`,
  whiteSpace: `nowrap`,
  width: `1px`,
};


const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));


const Copy = ({ content, duration = 5000, fileName = ``, trim = false }) => {
  const [copied, setCopied] = useState(false);

  const label = copied
    ? `${fileName ? `${fileName} ` : ``}copied to clipboard`
    : `${fileName ? `${fileName}: ` : ``}copy code to clipboard`;

  return (
    <button
      type="button"
      name={label}
      disabled={copied}
      className="code-copy-button"
      sx={{
        variant: `copyButton`,
      }}
      onClick={async () => {
        await copyToClipboard(trim ? content.trim() : content)
        setCopied(true)
        await delay(duration)
        setCopied(false)
      }}
    >
      {copied ? `Copied` : `Copy`}
      <span className="sc-only" aria-roledescription="status">
        {label}
      </span>
    </button>
  )
}

export default Copy;
