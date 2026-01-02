---
sidebar_position: 3
title: ROS 2 Fundamentals
description: Robot Operating System 2 architecture, nodes, topics, services
---

# ROS 2 Fundamentals

ROS 2 (Robot Operating System 2) is the industry-standard middleware for building robot applications. This chapter covers the core concepts and architecture of ROS 2.

## What is ROS 2?

ROS 2 is not an operating system, but rather a set of software libraries and tools for building robot applications:

- **Middleware**: Communication between components
- **Tools**: Visualization, simulation, debugging
- **Libraries**: Common robotics functionality
- **Ecosystem**: Thousands of packages from the community

### Key Improvements over ROS 1

| Feature | ROS 1 | ROS 2 |
|---------|-------|-------|
| Communication | Custom protocol | DDS standard |
| Real-time | Limited | Supported |
| Security | Basic | Built-in encryption |
| Multi-robot | Workarounds needed | Native support |
| Platforms | Linux only | Linux, Windows, macOS |

## Core Concepts

### Nodes

Nodes are the basic building blocks - individual processes that perform specific tasks:

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.get_logger().info('Node started!')

def main():
    rclpy.init()
    node = MyNode()
    rclpy.spin(node)
    rclpy.shutdown()
```

### Topics

Topics are named buses for publish/subscribe communication:

```
Publisher → Topic → Subscriber(s)
```

Example: Camera node publishes images to `/camera/image` topic, which multiple nodes can subscribe to.

### Services

Services provide synchronous request/response communication:

```
Client → Service → Server
         ↓
       Response
```

Example: Requesting a robot to move to a specific location and waiting for completion.

### Actions

Actions handle long-running tasks with feedback:

```
Client → Action Server
   ↑           ↓
Feedback ← Progress updates
   ↑           ↓
Result ←  Completion
```

Example: Navigating to a goal while receiving progress updates.

## ROS 2 Architecture

```
┌──────────────────────────────────────────┐
│              Application Layer            │
│  (Your robot code, algorithms, behaviors) │
├──────────────────────────────────────────┤
│            ROS 2 Client Library           │
│    (rclpy, rclcpp - language bindings)    │
├──────────────────────────────────────────┤
│               ROS 2 Middleware            │
│        (rmw - abstraction layer)          │
├──────────────────────────────────────────┤
│            DDS Implementation             │
│   (Fast DDS, Cyclone DDS, RTI Connext)   │
└──────────────────────────────────────────┘
```

## Working with ROS 2

### Creating a Workspace

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build
source install/setup.bash
```

### Creating a Package

```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_package
```

### Running Nodes

```bash
ros2 run my_package my_node
```

### Inspecting Topics

```bash
ros2 topic list
ros2 topic echo /camera/image
ros2 topic info /camera/image
```

## Common ROS 2 Packages

### Perception
- `image_transport`: Efficient image streaming
- `pcl_ros`: Point cloud processing
- `vision_opencv`: OpenCV integration

### Navigation
- `nav2`: Full navigation stack
- `slam_toolbox`: SLAM algorithms
- `robot_localization`: Sensor fusion

### Manipulation
- `MoveIt 2`: Motion planning
- `ros2_control`: Hardware abstraction
- `tf2`: Coordinate transformations

## Launch Files

Launch files start multiple nodes with configuration:

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_package',
            executable='node_1',
            name='node_1'
        ),
        Node(
            package='my_package',
            executable='node_2',
            name='node_2'
        ),
    ])
```

## Best Practices

1. **Modular Design**: One node per functionality
2. **Standard Interfaces**: Use common message types
3. **Parameters**: Make nodes configurable
4. **Logging**: Use ROS 2 logging for debugging
5. **Testing**: Write unit and integration tests

## Chapter Summary

ROS 2 provides essential infrastructure for robotics:

- Nodes are independent processes
- Topics enable publish/subscribe communication
- Services provide request/response patterns
- Actions handle long-running tasks with feedback
- DDS provides reliable, real-time communication

## Next Steps

In the next chapter, we'll explore digital twin simulation using Gazebo and Isaac Sim - essential tools for developing and testing robot applications.

---

*Continue to [Chapter 4: Digital Twin Simulation](../chapter-4-digital-twin/)*
