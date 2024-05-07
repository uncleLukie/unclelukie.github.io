---
title: "How to create a basic Octree in Unity"
seo_title: "How to create a basic Octree in Unity"
summary: "The why and how of creating an Octree in Unity"
description: "The why and how of creating an Octree in Unity"
slug: unity-octree
author: Luke Hewitt

draft: true
date: 2024-05-07T09:47:00+10:00
lastmod: 2024-05-07T09:47:00+10:00
expiryDate: 
publishDate: 

feature_image: 
feature_image_alt: 

categories:
  - Unity
  - C#
  - How To
  - Game Development
tags:
  - game dev
  - C#
  - how to
  - octree
  - Unity

toc: true
related: true
social_share: true
newsletter: false
disable_comments: false
---

# the need
picture this: you're building a smart weapon in your 3D game, and you need the projectiles of that weapon to find the 
nearest enemy to target. you could just run some quick and dirty code to iterate over every single enemy in the game 
and compare it to the weapon/projectile's location. that could work if you have a small amount of enemies, but what if 
you have 1000, or 10,000 enemies, and they're spread out all over the 3D map? your quick and dirty code is gonna make
your game lag... a lot. that's where an Octree comes in.

# the what
an octree is a tree data structure that divides 3D space into smaller and smaller partitions. it's like a binary tree
that you might use in a 2D game, but in 3D. the octree gets divided into 8 octants, and each octant can be divided into
8 more octants, and so on. this makes it fast and easy to find the nearest object to a given point in 3D space. this
can help itn a lot of ways, like visibility determination, collision detection, pathfinding, and a lot more.

# the how
here's a simple rundown of building a bounds-based octree in Unity:

### Defining an Octree Node
each node represents a cube in 3D Space, containing objects and up to 8 children (sub-cubes).
~~~csharp
class OctreeNode {
    Bounds bounds;               // spatial bounds of this node
    List<GameObject> objects;    // objects within this node
    OctreeNode[] children;       // child nodes
}
~~~

### Inserting objects
insert objects into the tree. if a node exceeds a certain capacity, it subdivides into 8 children and tries to insert
the object into the appropriate child node.
~~~csharp
void Insert(OctreeNode node, GameObject obj) {
    if (!node.bounds.contains(obj.position)) return;
    if (node.objects.count < MAX_OBJECTS || node.children == null) {
        node.objects.add(obj);
    } else {
        if (node.children == null) subdivide(node);
        // find the correct child to insert into and recurse
        foreach (child in node.children) {
            if (child.bounds.contains(obj.position)) {
                Insert(child, obj);
                return;
            }
        }
    }
}
~~~

### subdividing a node
when a node's capacity is exceeded, it subdivides into eight smaller nodes.
~~~csharp
void Subdivide(OctreeNode node) {
    float size = node.bounds.size / 2;
    Vector3[] offsets = {new Vector3(-size, -size, -size), new Vector3(-size, -size, size), ...};
    node.children = new OctreeNode[8];
    for (int i = 0; i < 8; i++) {
        Vector3 newCenter = node.bounds.center + offsets[i];
        node.children[i] = new OctreeNode(new Bounds(newCenter, new Vector3(size, size, size)));
    }
}
~~~

### finding the nearest object
to find the nearest object to a given point, we recursively search the tree, starting from the root node and moving
down to the leaf nodes.
~~~csharp
GameObject FindNearest(OctreeNode node, Vector3 point) {
    GameObject nearest = null;
    float nearestDist = float.MaxValue;
    // check objects in this node
    foreach (obj in node.objects) {
        float dist = Vector3.Distance(obj.position, point);
        if (dist < nearestDist) {
            nearest = obj;
            nearestDist = dist;
        }
    }
    // check children
    if (node.children != null) {
        foreach (child in node.children) {
            if (child.bounds.distanceTo(point) < nearestDist) {
                GameObject childNearest = FindNearest(child, point);
                float childDist = Vector3.Distance(childNearest.position, point);
                if (childDist < nearestDist) {
                    nearest = childNearest;
                    nearestDist = childDist;
                }
            }
        }
    }
    return nearest;
}
~~~

### update positions
if objects move, we need to update their positions in the tree.
~~~csharp
void UpdatePosition(GameObject obj, Vector3 oldPosition) {
    if (obj == null) return; // check for null object

    // firstly check if the object is still within it's current node's bounds
    OctreeNode currentNode;
    if (_objectToNodeMap.TryGetValue(obj, out currentNode)) {
        if (!currentNode.bounds.contains(obj.transform.position)) {
            // if the object has moved outside of the current node's bounds, remove it
            Remove(currentNode, obj);  // remove the object from the current node

            // reinsert the object at its new position
            Insert(_root, obj, true);  // reinsert starting from the root
        }
        // if the object is still within the bounds, theres no need to move it in the octree
    } else {
        // if for some reason the object wasn't in the map, add it back in
        Insert(_root, obj, true);
    }
}
~~~

### remove objects
if an object gets destroyed or moves out of the tree's bounds, we gotta remove it from the tree.
~~~csharp
void Remove(OctreeNode node, GameObject obj) {
    if (node == null || obj == null) return;

    if (node.Objects.Remove(obj)) {
        _objectToNodeMap.Remove(obj);
    } else {
        foreach (var child in node.Children) {
            if (child != null && child.bounds.contains(obj.transform.position)) {
                Remove(child, obj);
                break;
            }
        }
    }
}
~~~

# what's left?
so we've got a basic implementation of an octree in unity, but you'll still need to implement a Manager that
should handle the creation of the root node, crud operations and any other related tasks. you'll also have to make sure
any objects that move around are updated into the octree.

good luck~!