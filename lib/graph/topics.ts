import { normalizeTitle } from "./normalize";

export type StudyTopic = {
  title: string;
  aliases?: string[];
  parents: string[];
  summary: string;
  detail: string;
};

const topics: StudyTopic[] = [
  {
    title: "programming",
    summary: "Writing instructions a computer can run, then checking that the result matches what you meant.",
    detail: "A program stores values, makes decisions, and repeats steps. You break a job into those pieces and put them in an order the machine can follow. Later topics, such as data structures and algorithms, are ways to keep that order clear as the program grows.",
    parents: [],
  },
  {
    title: "python",
    aliases: ["python programming"],
    summary: "A programming language for scripts, data work, and applications, with syntax that stays close to plain English.",
    detail: "Python runs a file or a prompt line by line. Names hold values, functions do the work, and libraries handle files, numbers, and the web. It is a common first language because those same ideas move to other languages with different syntax.",
    parents: ["programming"],
  },
  {
    title: "object oriented programming",
    aliases: ["oop", "oops", "object oriented", "object orientation"],
    summary: "A way to structure a program as objects that keep their own data and the actions that use it.",
    detail: "Instead of one long list of steps, you group related data and behavior into objects. A class describes the shape, and each object is one live example of that shape. The usual tools are abstraction, encapsulation, inheritance, and polymorphism.",
    parents: ["programming"],
  },
  {
    title: "abstraction",
    summary: "Hiding the inner steps behind a small interface, so you can use a piece without knowing how it works.",
    detail: "A function that sorts a list is an abstraction: you pass the list and get it back in order. The swap or pivot steps stay inside. The rest of the program can depend on the result, not the recipe.",
    parents: ["object oriented programming"],
  },
  {
    title: "encapsulation",
    summary: "Keeping an object's data private and offering only the operations that are safe to call.",
    detail: "Other code should not reach in and rewrite an object's fields. It calls a method, and the object checks the change. That keeps invalid states, such as a negative balance, from spreading through the program.",
    parents: ["object oriented programming"],
  },
  {
    title: "inheritance",
    summary: "Letting a new class reuse an existing class, then add or replace some of its behavior.",
    detail: "A savings account can start from a general account and add interest. It keeps the shared methods and changes only what differs. Use inheritance when the new type really is a kind of the old one.",
    parents: ["object oriented programming"],
  },
  {
    title: "polymorphism",
    summary: "One call site, several types: each type supplies its own version of the same action.",
    detail: "A draw call can hit a circle or a square. The caller does not pick the formula. The object does. You can add a new shape without rewriting every place that asks something to draw.",
    parents: ["object oriented programming"],
  },
  {
    title: "class",
    aliases: ["classes"],
    summary: "A blueprint for objects: the data they store and the methods they can run.",
    detail: "The class is the definition, not a live value. It names the fields and the methods. Creating an object from it fills those fields with real data you can change.",
    parents: ["object oriented programming"],
  },
  {
    title: "object",
    aliases: ["objects"],
    summary: "One live instance of a class, with its own data separate from every other instance.",
    detail: "Two user objects can share the same methods and still hold different names. Changing one does not change the other. The class describes the shape. The object holds the current values.",
    parents: ["class", "object oriented programming"],
  },
  {
    title: "method",
    aliases: ["methods"],
    summary: "A function that belongs to a class and works on that object's own data.",
    detail: "When you call account.deposit(10), deposit is a method. It receives that account and updates its balance. Methods are how the rest of the program is allowed to change the object.",
    parents: ["class", "object oriented programming"],
  },
  {
    title: "interface",
    aliases: ["interfaces"],
    summary: "A contract of methods a class must provide, without deciding how those methods work.",
    detail: "An interface lists the calls other code may make, such as save and load. Each class fills those calls in its own way. Callers depend on the contract, so you can swap the class behind it.",
    parents: ["object oriented programming"],
  },
  {
    title: "composition",
    summary: "Building a type by holding other objects, instead of inheriting from them.",
    detail: "A car can contain an engine rather than being a kind of engine. The car calls the engine when it needs power. Prefer this when you want to reuse behavior without claiming one type is a subtype of another.",
    parents: ["object oriented programming"],
  },
  {
    title: "function",
    aliases: ["functions"],
    summary: "A named block of code you call with inputs to get a result, without repeating the steps.",
    detail: "You pass arguments in, the function runs its body, and it returns a value. The same function can be called from many places. That keeps a rule, such as how tax is calculated, in one spot.",
    parents: ["programming"],
  },
  {
    title: "variable",
    aliases: ["variables"],
    summary: "A name that holds a value the rest of the program can read and, usually, change.",
    detail: "The name is a label. The value can be a number, text, or a whole object. Assigning a new value updates what later lines see when they use that name.",
    parents: ["programming"],
  },
  {
    title: "loop",
    aliases: ["loops"],
    summary: "Repeating a block of code while a condition stays true, or once for each item in a collection.",
    detail: "A loop walks a list, retries a step, or keeps going until a counter finishes. Each pass is an iteration. The condition is what stops it, so a wrong condition can run forever.",
    parents: ["programming"],
  },
  {
    title: "conditional",
    aliases: ["conditionals", "if statement"],
    summary: "Choosing which code runs by testing something that is true or false.",
    detail: "An if checks a condition and runs one branch or another. Else covers the remaining case. Programs use this whenever the next step depends on the data, such as a passing score or an empty cart.",
    parents: ["programming"],
  },
  {
    title: "data structures",
    aliases: ["data structure"],
    summary: "Ways to organize values so a program can store them and get the right one back.",
    detail: "The shape you pick changes what is cheap. A list is good for order. A dictionary is good for lookup by name. Trees and graphs fit hierarchies and networks. Algorithms are the steps that run on these shapes.",
    parents: ["programming"],
  },
  {
    title: "array",
    aliases: ["arrays", "list", "lists"],
    summary: "An ordered collection of values, each one reached by its position.",
    detail: "The first item is usually at index 0. You can walk the items from start to end, or jump straight to a known index. Order matters: swapping two positions changes the array.",
    parents: ["data structures"],
  },
  {
    title: "dictionary",
    aliases: ["dictionaries", "dict", "hash map"],
    summary: "A collection that stores a value under a key, so you can look that value up by name.",
    detail: "A key such as a username maps to one value, such as a score. Finding it does not require scanning every entry. Keys should be unique, or the lookup would not know which value to return.",
    parents: ["data structures"],
  },
  {
    title: "stack",
    summary: "A collection that adds and removes items at the same end, so the last one in is the first one out.",
    detail: "Push puts an item on top. Pop takes that top item back. Undo history and nested function calls both work this way: the most recent thing is the one you deal with next.",
    parents: ["data structures"],
  },
  {
    title: "queue",
    aliases: ["queues"],
    summary: "A collection that adds items at one end and removes them at the other, first in, first out.",
    detail: "New work joins the back. The oldest item leaves the front. Print jobs and message lines use a queue when fairness means handling requests in arrival order.",
    parents: ["data structures"],
  },
  {
    title: "tree",
    aliases: ["trees"],
    summary: "A hierarchy of nodes where each node has one parent and any number of children.",
    detail: "The top node is the root. A folder tree and the structure of an HTML page are trees. You move down through children or back up to the parent. There are no cycles.",
    parents: ["data structures"],
  },
  {
    title: "graph",
    aliases: ["graphs"],
    summary: "A set of nodes connected by edges, for relationships that are not a strict hierarchy.",
    detail: "An edge can link any two nodes, and the link can go one way or both. Maps, friendships, and web links are graphs. Unlike a tree, a node can have many parents and the connections can form a loop.",
    parents: ["data structures"],
  },
  {
    title: "linked list",
    summary: "A sequence of nodes where each node points at the next one, instead of sitting at a fixed index.",
    detail: "To reach the third item you follow the first, then the second. Inserting in the middle is a pointer change, not a shift of every later item. You cannot jump straight to an index the way you can with an array.",
    parents: ["data structures"],
  },
  {
    title: "algorithms",
    aliases: ["algorithm"],
    summary: "A step-by-step procedure that turns an input into the result you want.",
    detail: "The steps have to be precise enough to follow without guessing. Sorting, searching, and walking a tree are algorithms. Two algorithms can solve the same problem and still differ in how many steps they take.",
    parents: ["programming"],
  },
  {
    title: "sorting",
    summary: "Arranging items into an order, such as smallest to largest or A to Z.",
    detail: "A sort compares items and moves them until the order holds. Bubble, selection, and insertion sorts are simple and slower on long lists. Merge sort, quicksort, and heap sort do less work as the list grows.",
    parents: ["algorithms"],
  },
  {
    title: "bubble sort",
    summary: "A sort that walks the list and swaps neighbors that are out of order, until a pass makes no swaps.",
    detail: "Each pass moves a larger item toward the end, like a bubble rising. It is easy to follow and slow on long lists, because it may compare every pair. It is useful for learning swaps, not for large data.",
    parents: ["sorting"],
  },
  {
    title: "selection sort",
    summary: "A sort that finds the smallest remaining item and places it at the front of what is left.",
    detail: "The left side grows as a finished sorted prefix. Each pass scans the rest of the list once. It makes few swaps, but it still looks at most of the list every time, so large inputs stay slow.",
    parents: ["sorting"],
  },
  {
    title: "insertion sort",
    summary: "A sort that takes the next item and inserts it where it belongs in the already sorted part.",
    detail: "The start of the list stays sorted. A new item shifts neighbors over until it fits. Nearly sorted lists need little shifting, which is why this sort is quick on small or almost-ordered data.",
    parents: ["sorting"],
  },
  {
    title: "merge sort",
    summary: "A sort that splits the list in half, sorts each half, and merges the two ordered halves.",
    detail: "Splitting continues until each piece has one item. Merging two sorted lists is a walk from both fronts, always taking the smaller head. The work stays predictable even on large lists.",
    parents: ["sorting"],
  },
  {
    title: "quicksort",
    aliases: ["quick sort"],
    summary: "A sort that picks a pivot, puts smaller items on one side and larger items on the other, then sorts each side.",
    detail: "After the split, the pivot is in its final place. The two sides are sorted the same way. It is fast on typical data. A poor pivot, such as always picking the largest item, makes it much slower.",
    parents: ["sorting"],
  },
  {
    title: "heap sort",
    summary: "A sort that builds a heap so the next item in order can be pulled off the top.",
    detail: "A heap keeps the largest or smallest item at the root. You remove that root, repair the heap, and repeat. The result comes out in order, without needing a second full copy of the list.",
    parents: ["sorting"],
  },
  {
    title: "searching",
    aliases: ["search"],
    summary: "Finding an item in a collection, or deciding that it is not there.",
    detail: "A linear search checks items one by one. If the data is sorted, binary search can discard half of what remains on each step. The layout of the data decides which search is possible.",
    parents: ["algorithms"],
  },
  {
    title: "binary search",
    summary: "Finding an item in a sorted list by checking the middle and dropping the half that cannot hold it.",
    detail: "Compare the target with the middle item. If the target is smaller, continue on the left. If it is larger, continue on the right. Each step cuts the remaining range in half, so the list must already be sorted.",
    parents: ["searching", "algorithms"],
  },
  {
    title: "recursion",
    summary: "A function that solves a problem by calling itself on a smaller input, then combining the results.",
    detail: "Each call must get closer to a base case that stops the chain. Factorial, tree walks, and merge sort all do this. Without a base case the calls never end, and the program runs out of stack space.",
    parents: ["function", "algorithms"],
  },
];

const byAlias = new Map<string, StudyTopic>();
for (const topic of topics) {
  byAlias.set(normalizeTitle(topic.title), topic);
  for (const alias of topic.aliases ?? []) byAlias.set(normalizeTitle(alias), topic);
}

export function studyTopic(title: string) {
  return byAlias.get(normalizeTitle(title)) ?? null;
}

export type StudyNeighbor = {
  title: string;
  kind: "parent" | "child";
  summary: string;
};

export function studyNeighbors(title: string): StudyNeighbor[] {
  const focus = studyTopic(title);
  if (!focus) return [];
  const parents: StudyNeighbor[] = [];
  for (const parentTitle of focus.parents) {
    const parent = studyTopic(parentTitle);
    if (!parent) continue;
    parents.push({ title: parent.title, kind: "parent", summary: parent.summary });
  }
  const children: StudyNeighbor[] = [];
  for (const topic of topics) {
    if (!topic.parents.includes(focus.title)) continue;
    children.push({ title: topic.title, kind: "child", summary: topic.summary });
  }
  return [...parents, ...children];
}

export function isKnownAncestor(ancestorTitle: string, descendantTitle: string) {
  const ancestor = studyTopic(ancestorTitle);
  const start = studyTopic(descendantTitle);
  if (!ancestor || !start || ancestor.title === start.title) return false;
  const seen = new Set<string>();
  const stack = [...start.parents];
  while (stack.length > 0) {
    const next = stack.pop();
    if (!next || seen.has(next)) continue;
    seen.add(next);
    if (next === ancestor.title) return true;
    const topic = byAlias.get(normalizeTitle(next));
    if (topic) stack.push(...topic.parents);
  }
  return false;
}
