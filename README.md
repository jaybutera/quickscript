I've always thought that programming should be able to move beyond the
keyboard. I mean the keyboard has been here since the beginning even through
all the changes in computing. I think its because of the amazing tools that we
build on top of. Like the Linux shell, bash, and all the tools that have built
in them.
There are visual programming languages today. Like LabView or Alice. But
they're domain specific languages. They aren't for the general purpose
programmer like most of our favorite languages are; Python, C, javascript.
LISP offers a pretty good abstraction policy by with it's macro system that
allows for a play between code and data. Specifically,
1. Code is data and vice versa. Which makes it really easy to visualize a
   program as a data structure in 2D space.
2. The macro system allows the core language to be extended and for domain
   specific languages to be built in.

Visual programming needs to be simple (i.e. looking at no more than a block of "code" or one
concept at a time) in order for it to be useful. Therefore it makes sense to
use a language that can be naturally extended into specific domains. A
programmer would just load a library of data/code-structures and build from the
primitives. This is opposed to a language like Python which will always
require the same syntactic setup no matter the scope of the work. It's arduous
and requires a keyboard for all that typing. But with macros that can be
abstracted away into clean looking data structures.

Furthermore, I want to be coding from my phone where I can use my fingers and
interact more naturally with the environment. Again I think a mouse here is an
obstruction to a natural flow in this type of programming environment.

![defun id example](https://github.com/jaybutera/quickscript/blob/master/media/id_screenshot.png)
