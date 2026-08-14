"use strict";

const certificateUrl = document.body.dataset.certificateUrl || window.location.href;
const copyButton = document.querySelector("#copyCertificateLink");
const printButton = document.querySelector("#printCertificate");
const copyToast = document.querySelector("#copyToast");

async function copyCertificateLink() {
  try {
    await navigator.clipboard.writeText(certificateUrl);
  } catch {
    const input = document.createElement("textarea");
    input.value = certificateUrl;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  copyToast.classList.add("show");
  window.setTimeout(() => copyToast.classList.remove("show"), 2200);
}

copyButton.addEventListener("click", copyCertificateLink);
printButton.addEventListener("click", () => window.print());
