import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-links">
            <div className="footer-column">
              <div className="footer-column-header">
                <div className="footer-column-title">Company</div>
              </div>
              <div className="footer-column-items">
                <div className="footer-link-item">
                  <a href="#" className="footer-link">About Us</a>
                </div>
                <div className="footer-link-item">
                  <a href="#" className="footer-link">Careers</a>
                </div>
                <div className="footer-link-item">
                  <a href="#" className="footer-link">Contact</a>
                </div>
              </div>
            </div>

            <div className="footer-column">
              <div className="footer-column-header">
                <div className="footer-column-title">Resources</div>
              </div>
              <div className="footer-column-items">
                <div className="footer-link-item">
                  <a href="#" className="footer-link">Help Center</a>
                </div>
                <div className="footer-link-item">
                  <a href="#" className="footer-link">Safety</a>
                </div>
                <div className="footer-link-item">
                  <a href="#" className="footer-link">Guidelines</a>
                </div>
              </div>
            </div>

            <div className="footer-column">
              <div className="footer-column-header">
                <div className="footer-column-title">Legal</div>
              </div>
              <div className="footer-column-items">
                <div className="footer-link-item">
                  <a href="#" className="footer-link">Privacy Policy</a>
                </div>
                <div className="footer-link-item">
                  <a href="#" className="footer-link">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-social">
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_145_1066)">
                  <path d="M19.6875 10C19.6875 4.64844 15.3516 0.3125 10 0.3125C4.64844 0.3125 0.3125 4.64844 0.3125 10C0.3125 14.8352 3.85508 18.843 8.48633 19.5703V12.8004H6.02539V10H8.48633V7.86562C8.48633 5.43789 9.93164 4.09687 12.1453 4.09687C13.2055 4.09687 14.3141 4.28594 14.3141 4.28594V6.66875H13.0922C11.8891 6.66875 11.5137 7.41562 11.5137 8.18164V10H14.2004L13.7707 12.8004H11.5137V19.5703C16.1449 18.843 19.6875 14.8352 19.6875 10Z" fill="#9CA3AF"/>
                </g>
                <defs>
                  <clipPath id="clip0_145_1066">
                    <path d="M0 0H20V20H0V0Z" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_145_1069)">
                  <path d="M16.25 1.25H1.24609C0.558594 1.25 0 1.81641 0 2.51172V17.4883C0 18.1836 0.558594 18.75 1.24609 18.75H16.25C16.9375 18.75 17.5 18.1836 17.5 17.4883V2.51172C17.5 1.81641 16.9375 1.25 16.25 1.25ZM5.28906 16.25H2.69531V7.89844H5.29297V16.25H5.28906ZM3.99219 6.75781C3.16016 6.75781 2.48828 6.08203 2.48828 5.25391C2.48828 4.42578 3.16016 3.75 3.99219 3.75C4.82031 3.75 5.49609 4.42578 5.49609 5.25391C5.49609 6.08594 4.82422 6.75781 3.99219 6.75781ZM15.0117 16.25H12.418V12.1875C12.418 11.2188 12.3984 9.97266 11.0703 9.97266C9.71875 9.97266 9.51172 11.0273 9.51172 12.1172V16.25H6.91797V7.89844H9.40625V9.03906H9.44141C9.78906 8.38281 10.6367 7.69141 11.8984 7.69141C14.5234 7.69141 15.0117 9.42188 15.0117 11.6719V16.25Z" fill="#9CA3AF"/>
                </g>
                <defs>
                  <clipPath id="clip0_145_1069">
                    <path d="M0 0H17.5V20H0V0Z" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_145_1072)">
                  <path d="M8.75391 5.50781C6.26953 5.50781 4.26562 7.51172 4.26562 9.99609C4.26562 12.4805 6.26953 14.4844 8.75391 14.4844C11.2383 14.4844 13.2422 12.4805 13.2422 9.99609C13.2422 7.51172 11.2383 5.50781 8.75391 5.50781ZM8.75391 12.9141C7.14844 12.9141 5.83594 11.6055 5.83594 9.99609C5.83594 8.38672 7.14453 7.07812 8.75391 7.07812C10.3633 7.07812 11.6719 8.38672 11.6719 9.99609C11.6719 11.6055 10.3594 12.9141 8.75391 12.9141ZM14.4727 5.32422C14.4727 5.90625 14.0039 6.37109 13.4258 6.37109C12.8438 6.37109 12.3789 5.90234 12.3789 5.32422C12.3789 4.74609 12.8477 4.27734 13.4258 4.27734C14.0039 4.27734 14.4727 4.74609 14.4727 5.32422ZM17.4453 6.38672C17.3789 4.98438 17.0586 3.74219 16.0312 2.71875C15.0078 1.69531 13.7656 1.375 12.3633 1.30469C10.918 1.22266 6.58594 1.22266 5.14062 1.30469C3.74219 1.37109 2.5 1.69141 1.47266 2.71484C0.445313 3.73828 0.128906 4.98047 0.0585937 6.38281C-0.0234375 7.82812 -0.0234375 12.1602 0.0585937 13.6055C0.125 15.0078 0.445313 16.25 1.47266 17.2734C2.5 18.2969 3.73828 18.6172 5.14062 18.6875C6.58594 18.7695 10.918 18.7695 12.3633 18.6875C13.7656 18.6211 15.0078 18.3008 16.0312 17.2734C17.0547 16.25 17.375 15.0078 17.4453 13.6055C17.5273 12.1602 17.5273 7.83203 17.4453 6.38672ZM15.5781 15.1562C15.2734 15.9219 14.6836 16.5117 13.9141 16.8203C12.7617 17.2773 10.0273 17.1719 8.75391 17.1719C7.48047 17.1719 4.74219 17.2734 3.59375 16.8203C2.82812 16.5156 2.23828 15.9258 1.92969 15.1562C1.47266 14.0039 1.57813 11.2695 1.57813 9.99609C1.57813 8.72266 1.47656 5.98438 1.92969 4.83594C2.23438 4.07031 2.82422 3.48047 3.59375 3.17187C4.74609 2.71484 7.48047 2.82031 8.75391 2.82031C10.0273 2.82031 12.7656 2.71875 13.9141 3.17187C14.6797 3.47656 15.2695 4.06641 15.5781 4.83594C16.0352 5.98828 15.9297 8.72266 15.9297 9.99609C15.9297 11.2695 16.0352 14.0078 15.5781 15.1562Z" fill="#9CA3AF"/>
                </g>
                <defs>
                  <clipPath id="clip0_145_1072">
                    <path d="M0 0H17.5V20H0V0Z" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20H0V0H20V20Z" stroke="#E5E7EB"/>
                <path d="M17.9441 5.92613C17.9568 6.10379 17.9568 6.28148 17.9568 6.45914C17.9568 11.8779 13.8325 18.1216 6.29441 18.1216C3.97207 18.1216 1.81473 17.4489 0 16.2815C0.329961 16.3195 0.647187 16.3322 0.989844 16.3322C2.90605 16.3322 4.67004 15.685 6.07867 14.581C4.27664 14.5429 2.76648 13.3627 2.24617 11.7383C2.5 11.7764 2.75379 11.8018 3.02031 11.8018C3.38832 11.8018 3.75637 11.751 4.09898 11.6622C2.22082 11.2814 0.812148 9.63172 0.812148 7.63934V7.58859C1.35781 7.89316 1.99238 8.08352 2.66492 8.10887C1.56086 7.37281 0.837539 6.11648 0.837539 4.69516C0.837539 3.93375 1.04055 3.23578 1.3959 2.62664C3.41367 5.11395 6.44668 6.73828 9.84766 6.91598C9.78422 6.61141 9.74613 6.29418 9.74613 5.97691C9.74613 3.71801 11.5736 1.87793 13.8451 1.87793C15.0253 1.87793 16.0913 2.37285 16.84 3.17234C17.7664 2.99469 18.6547 2.65203 19.4416 2.1825C19.137 3.1343 18.4898 3.93379 17.6395 4.44137C18.4644 4.35258 19.2639 4.1241 19.9999 3.80687C19.4416 4.61902 18.7436 5.34234 17.9441 5.92613Z" fill="#9CA3AF"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2024 TravelPro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

