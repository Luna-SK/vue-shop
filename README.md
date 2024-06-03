# Vue-Shop

## Student Information

> **Student Name**: 祁建栋
>
> **Student ID**: 22219131154

## Project Brief

> **Project**: E-commerce Management Platform
>
> **Technology Stack**: Vue3 + TypeScript + Vue-Router + Element Plus + Axios + ECharts

## Project Setup

### Install denpendencies(use pnpm recommended)

```sh
npm install
# recommended use pnpm
# pnpm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Project Deployment

### Project backend server preparation

1. install `node.js` and `npm`
2. install `pm2` globally

    ```sh
    npm install -g pm2
    ```

3. install the dependencies

    ```sh
    npm install
    # recommended use pnpm
    # pnpm install
    ```

4. install mysql and create a database named `mydb`

5. import the `mydb.sql` file into the `mydb` database

    ```mysql
    source `mydb.sql path`
    ```

6. modify the `default.json` file in the `vue-api-server/config` directory according to your own database configuration

### Project backend server deployment

1. decompress the `vue-api-server.rar` file
2. enter the `vue-api-server` directory
3. install the dependencies
4. run the server

```sh
node app.js
# recommended: use pm2 to manage the server
# pm2 start app.js --name 'your-server-name'
```

### Project frontend deployment

use nginx or other web server to deploy the `dist` directory

> **Note**: server information of backend is in the `src/utils/serverInfo.ts` file
