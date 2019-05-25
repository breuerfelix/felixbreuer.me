---
layout: project
title: KingBot - Automate Travian Kingdoms
date: 2018-06-18 22:15:00 +01:00
modify_date: 2018-07-25 07:50:00 +01:00
tags: selenium bot automation travian kingdoms python
category: project
---

Welcome to my personal documentation site for [king-bot](https://github.com/scriptworld-git/king-bot).

Since I already wrote a really good documentation on the original GitHub repository, it would be kinda dumb to copy and paste the readme.md onto this website.  
That's why I decided to talk more about the 'why' on this project page.

## general

The project is written in [Python 3](https://www.python.org) with the [Selenium](http://selenium-python.readthedocs.io) package. Selenium is a tool for automating your tasks.  
It opens a new browser instance which can be controlled by code.  
My project [Series-Monitor](/projects/series-monitor) was also writte with the help of selenium, but I wrote it in Java so there is way more overhead than a project written in python.  
That was acceptable because it also had a GUI, king-bot was originally planned without a gui. At least the core of it.

Another good reason to write this project in python was the fact that I never ever written even one line in python and really wanted to learn this language, since it is really popular in the automated testing industry.

#### why travian kingdoms ?

Good question.  
I played that game some years ago, the old and new version, and had alot of fun doing so.  
The community is really friendly and I had the pleasure to meet plenty of nice people.

There is one bad factor about this game. You need to be online **alot** to be a successful player.  
Seems fair right ? No. You only have to click once every 10 min, send your farmlists and leave the game again...  
That was really boring and frustrating cause no one wants to get up in the middle of the game just for a little browsergame.

In the past I solved this problem with a little 'auto-clicker' tool, running the whole night, pressing one single button.  
This was okay but I wanted more features like adding new farms and removing red farms from the farmlist.

The idea of king-bot was born !

Unfortunately I had no spare time programming the bot because of other projects. I wanted to learn web development instead.  
Now, some months later I finally started this project with it's basic features in hope that many other people will join and help me improving this bot.

## classes

In general I choosed one class for every component in the game.  
That helped alot because once you initialized all villages for example, you just have to call one function `openVillage(2)` on the gameworld class and you opened it.  
There is no need for defining every possible state of the game in functions because a class always knows its state and can handle accordingly to it.

This helps alot when programming new features because it's really easy to associate them with one of those gameobjects.

I got classes for:

-   account
-   gameworld
-   village
-   (resource/building) slot

---

**update:** _25.07.18_

I decided to move all logic out of these classes.  
In nearly every function I had to use some functions from the parent class so I thought a little bit longer about the structure.  
The whole project is more like a functional process. Every 'command' has it's own, independent structure.  
For example, the farming thread doesn't care if slot xy is upgradeable or not.

Because the plan for a GUI is in my head, I moved all gamestate out of the functional process.  
The above structure represents the whole gamestate now, and the classes only contain functions which load the game state.  
For now they are not implemented, but they will be really usefull when showing the state in a GUI.

## custom driver

Seleniums base driver class is really good in general, but I am a huge fan of short function names and deep class structures.  
That allows me to make easier changes on general tasks like finding and element.

There is one example I wanna mention to explain myself a little bit better.  
If I want to wait after clicking on a button for the page to load, you can simply put a `time.sleep(2)` statement after your click.  
I decided to make a function on my custom browser class like the following:

```python
def sleep(self, seconds):
    time.sleep(seconds)
```

At first many people might say:

> uhm that is really ridiculous !

A few days later I implemented the headless mode and this function saved my life.

After a while I thought:

> well, the browser is alot faster because it doesn't have to load all the images... now I have to adjust all my sleep times to be shorter, or no one will ever notice the bot being faster in headless mode'.

Having the function 2 lines of code later I was done adjusting the sleep times in headless mode.  
After setting a class attribute called `self.headless = True` I edited my function:

```python
def sleep(self, seconds):
    if self.headless:
        seconds = seconds / 2

    time.sleep(seconds)
```

Done.

Life can be really easy sometimes, just think a little into the future when planning your project.  
Make things like that your habit, and your are good to go.

### use_browser decorator

If any Thread wants to access the browser, it needs to call `browser.use()` and when finished `browser.done()` method.  
This prevents many Threads from clicking in the browser at the same time. It would be a complete mess !

All code using the browser, was also always in an `try-catch` block, so it releases the browser even though an exception occured.  
In the future I want to reload the startpage after an exception occured, so there won't be any window open, which may confuse the next Thread.

```python
def use_browser(org_func: Any):
    def wrapper(*args, **kwargs):
        browser = None
        for arg in args:
            if type(arg) is client:
                browser = arg
                break

        for _, value in kwargs.items():
            if type(value) is client:
                browser = value
                break

        if browser != None:
            rv = None
            browser.use()

            try:
                rv = org_func(*args, **kwargs)
            except Exception as e:
                rv = None
                log("exception in function: {} exception: {}".format(
                    org_func.__name__, str(e)))
            finally:
                browser.done()

                return rv

        else:
            return org_func(*args, **kwargs)

return wrapper
```

This decorator can be used liked this:

```python
@use_browser
def start_farming(browser:client, ...):
    pass
```

Writing this function is now kinda easy. No Try-Catch, no `browser.use()`.

Also, if I want to implement refreshing the page after an error occured, there is only one place I need to insert the new code in. Damn handy.
