The Great Refactoring
=====================
<br>

<center>
<img src="http://imgs.xkcd.com/comics/good_code.png" alt="Drawing" style="width: 300px;"/>
</center>

Purpose
-------
Zombit is a reasonably fun game, but there is little to no actual gameplay.
After being developed for almost a year using poor coding conventions, the game's source has become a mess.
Once the source has been cleaned up and documented, further developing the game will be significantly easier.

Development will be halted until refactoring is complete.  Gameplay should not be affected during any portion of the refactoring.

Outline
-------
1. Legacy code removal
    * remove unused functions
    * remove commented code
    * etc
2. Namespacing and reorganization
    * restructure code
    * consolidate redundant code
    * separate individual klasses out of entity.js, level.js
    * wrap each file's contents in a namespace object
3. Documentation
    * improve usage of descriptive variable/function names
    * javadoc style documentation
4. Finalization
    * re-apply code formatting
    * optimize where possible
