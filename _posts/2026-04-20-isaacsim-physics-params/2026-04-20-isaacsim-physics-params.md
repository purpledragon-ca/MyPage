---
title: "Isaac Sim Physics Parameters: A Practical Summary"
date: "2026-04-20"
tags: ['IsaacSim', 'PhysX', 'Physics', 'Tuning']
---

This post is a practical summary of commonly used Isaac Sim rigid-body parameters. The main idea is simple: separate parameters for motion damping, sleep and stabilization, collision robustness, and simulation cost.

## 1. Quick checklist

Use this table first, then read the detailed sections below.

| Group | Parameter | Short usage |
| --- | --- | --- |
| Stable | `physxRigidBody:linearDamping` | Slows translational motion over time |
| Stable | `physxRigidBody:angularDamping` | Slows rotational motion over time |
| Stable | `physxCollision:contactOffset` | Starts contact generation a bit earlier without enlarging the real collider |
| Stable | `physxCollision:restOffset` | Adjusts resting distance target for smoother stable contact |
| Stable | `physxRigidBody:enableCCD` | Reduces tunneling for fast objects |
| Stable | `physxRigidBody:enableSpeculativeCCD` | A speculative CCD option for fast-motion cases |
| Stable | `physxRigidBody:maxLinearVelocity` | Caps linear speed |
| Stable | `physxRigidBody:maxAngularVelocity` | Caps angular speed |
| Stable | `physxRigidBody:maxContactImpulse` | Caps contact impulse |
| Stable | `physxRigidBody:maxDepenetrationVelocity` | Caps penetration correction speed |
| Stable | `physxRigidBody:solverPositionIterationCount` | Improves position solve quality at extra cost |
| Stable | `physxRigidBody:solverVelocityIterationCount` | Improves velocity solve quality at extra cost |
| Speed up | `physics:startsAsleep` | Only affects whether the body begins asleep |
| Speed up | `physxRigidBody:sleepThreshold` | Decides when a low-energy body can sleep |
| Speed up | `physxRigidBody:stabilizationThreshold` | Helps nearly-settled bodies stabilize sooner |
| Speed up | `physics:approximation` | Chooses collision proxy shape and affects performance directly |
| Some may use | `physxCollision:torsionalPatchRadius` | Controls torsional friction around the contact normal |
| Some may use | `physxRigidBody:enableGyroscopicForces` | Enables gyroscopic effects for fast spinning bodies |
| Some may use | `physxRigidBody:lockedPosAxis` | Locks selected translation axes |
| Some may use | `physxRigidBody:lockedRotAxis` | Locks selected rotation axes |
| Leave as-is | `physics:centerOfMass` | Center of mass setting, not usually a first-pass tuning target |
| Leave as-is | `physics:diagonalInertia` | Inertia setting, often fine as authored |
| Leave as-is | `physics:principalAxes` | Principal-axis inertia orientation, rarely adjusted first |
| Leave as-is | `physxRigidBody:cfmScale` | Lower-level solver behavior parameter |
| Leave as-is | `physxRigidBody:contactSlopCoefficient` | Contact tolerance related parameter |
| Leave as-is | `physxRigidBody:retainAccelerations` | Acceleration retention behavior, rarely changed in routine tuning |
| Leave as-is | `physxRigidBody:solveContact` | Contact solve control, usually left untouched unless debugging a specific issue |

## 2. Damping: make motion slow down naturally

- `physxRigidBody:linearDamping` slows translational motion.
- `physxRigidBody:angularDamping` slows rotational motion.

These behave like drag terms. If an object slides or spins for too long, damping is usually the first thing to check.

## 3. Sleep and stabilization: stop jitter and extra computation

- `physics:startsAsleep` only affects the initial state.
- `physxRigidBody:sleepThreshold` controls when a moving body can go to sleep.
- `physxRigidBody:stabilizationThreshold` helps low-energy bodies settle more cleanly.

If the goal is not "slow down" but "stop simulating once stable", these are often more important than damping.

## 4. Collision geometry vs contact behavior

- Enlarging the collider changes the real collision shape.
- `physxCollision:contactOffset` does not enlarge the collider; it makes contacts get generated slightly earlier.
- `physxCollision:restOffset` affects the target resting distance at stable contact.

These are related, but they are not the same tool.

## 5. CCD for fast motion

- `physxRigidBody:enableCCD`
- `physxRigidBody:enableSpeculativeCCD`

Use them when fast objects may tunnel through thin geometry between frames.

## 6. Limits that keep simulation from exploding

- `physxRigidBody:maxLinearVelocity`
- `physxRigidBody:maxAngularVelocity`
- `physxRigidBody:maxContactImpulse`
- `physxRigidBody:maxDepenetrationVelocity`

These are useful guardrails when collisions become too violent or penetration correction becomes unstable.

## 7. Solver iterations

- `physxRigidBody:solverPositionIterationCount`
- `physxRigidBody:solverVelocityIterationCount`

Higher values can improve contact quality and constraint stability, but they also cost more.

## 8. Approximation mode matters for performance

`physics:approximation` decides which collision proxy is used. For simple objects, lighter approximations are usually better for speed.

For performance-first cases, a rough fast-to-slow order is often:

1. `boundingSphere`
2. `boundingCube`
3. `convexHull`
4. `meshSimplification`
5. `none`
6. `convexDecomposition`
7. `sphereFill`
8. `sdf`

For a cube, `box` is usually the natural choice.

## 9. Advanced parameters that are sometimes useful

- `physxCollision:torsionalPatchRadius` affects torsional friction around the contact normal.
- `physxRigidBody:enableGyroscopicForces` matters more for high-speed spinning bodies.
- `physxRigidBody:lockedPosAxis` and `physxRigidBody:lockedRotAxis` are practical when motion should stay in a plane or around selected axes only.

## 10. A practical tuning order

1. Pick a reasonable `physics:approximation`.
2. Tune `linearDamping` and `angularDamping`.
3. Tune `sleepThreshold` and `stabilizationThreshold`.
4. Enable CCD if fast tunneling appears.
5. Add velocity / impulse limits if collisions become too aggressive.
6. Increase solver iterations only if contact quality is still not enough.

The key idea is to map the symptom to the right parameter group instead of changing everything at once.
