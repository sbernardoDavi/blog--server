"use client";

import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-text">
          <h2 className="footer-ladp">
            <span className="ladp-gradient-footer ">LADP</span>
          </h2>
          {/* <p className="footer-subtitle">LIGA ACADÊMICA DE DIREITO PÚBLICO</p> */}
        </div>

        <p className="footer-dev">
          Desenvolvido por ©{" "}
          <a
            href="https://www.instagram.com/bernardx_davi/"
            style={{ color: "red" }}
          >
            Davi Bernardo
          </a>
        </p>
      </div>
    </footer>
  );
}
