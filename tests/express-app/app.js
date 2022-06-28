/*
	TSLite - converts your valid JavaScript to TypeScript v0.5.6
	Copyright (c) 2022 The Zonebuilder <zone.builder@gmx.com>
	https://github.com/zonebuilder/tslite-node
	License: MIT
*/
/*eslint no-unused-vars: ["error", {"args": "none"}]*/
/* tslite-add
 * interface Request { app: any; }
 * interface Response { locals: any; render: Function; }
 */
const cookieParser = require('cookie-parser')
const express = require('express')
const httpErrors = require('http-errors')
const logger = require('morgan')
const path = require('path')

const indexRouter = require('./routes/index')

/// @ts-ignore
const app = express()

app.set('views', path.join(__dirname, 'views'))
// view engine setup
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(httpErrors(404))
})

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    /// @ts-ignore
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
