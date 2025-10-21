## Introduction
A freelancer recruitment platform with integrated contract template support, built to connect clients in need of services with freelancers offering specialized skills. The project not only focuses on creating a flexible and transparent hiring environment but also integrates features to support the **drafting, signing, and management** of contracts directly on the platform, helping to minimize risks during collaboration. The system allows users to register for accounts as either a **freelancer or a client**, upload personal information, post jobs, or apply for projects. The project aims to build a comprehensive solution that combines online recruitment and smart contract management, delivering a seamless and reliable experience for both hirers and freelancers.

## Teck Stack
- **Frontend:** ReactJS
- **Backend:** ExpressJS

<section id="project-structure">
  <h2>Project Structure</h2>
  <pre><code>
project
│
├── webapp/                     
│   ├── node_modules
│   ├── src/
│   │   ├── Components/    # small parts contributes to a page
│   │   ├── ContextAPI/    # Authorization, be cautious and examine before modifying
│   │   ├── Page/          # Stacks of 1 or many components
│   │   ├── Public/        # Images and icons
│   │   ├── App.jsx        # Page's link ebstablishment
│   │   ├── main.jsx                 
│   │   ├── index.css
│   │   └── assets/      
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.lock.json
│   ├── package.json
│   └── vite.config.js
│
├── server/       
│   ├── node_modules
│   ├── data/                     # Json type data for monitoring and testing
│   ├── public/                   # Images
│   ├── routes/                  
│   │   ├── api/                  # API definition
│   │   ├── app.js                # API routing in server
│   ├── .env                      # Simulated environment
│   ├── package.lock.json
│   ├── package.json              
└── └── server.js                 
  </code></pre>
</section>

## Guide
1. Install all dependencies in **dependencies** in `package.json`.
2. Open 2 terminals, in `webapp` type:
```
npm run dev
```
in `webserver` type
```
node server.js
```
