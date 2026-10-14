"use client";
import { createPortal } from "react-dom";

// The certificate that comes out of the printer. It is only ever drawn for
// print (see .cert-print in globals.css): when printing, everything else on
// the page is hidden and this fills a landscape page. It sits directly in
// <body> rather than inside the page, because a `fixed` layer inside an
// element that animates in is sized to that element, not to the sheet.
const Certificate = ({
  name,
  when,
  habit,
}: {
  name: string;
  when: string;
  habit?: string;
}) =>
  createPortal(
    <div className="cert-print" aria-hidden>
      <div className="cert-frame">
        <div className="cert-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.svg" alt="" className="cert-logo" />
          <p className="cert-kicker">Certificate of completion</p>
          <h1 className="cert-title">Medication Safety Foundations</h1>
          <p className="cert-line">This certifies that</p>
          <p className="cert-name">{name || "Student"}</p>
          <p className="cert-line">
            has completed all the lessons, activities, and cases of the
            <br />
            <strong>Pharmacology Crash Course 1</strong>
          </p>
          {habit && <p className="cert-habit">&ldquo;{habit}&rdquo;</p>}
          <div className="cert-foot">
            <div>
              <p className="cert-date">{when}</p>
              <p className="cert-label">Date</p>
            </div>
            <p className="cert-motto">
              check → think → act → recheck.
              <br />
              Every med, every time.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );

export default Certificate;
