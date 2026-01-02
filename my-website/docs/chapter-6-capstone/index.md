---
sidebar_position: 6
title: "Capstone: Simple AI-Robot Pipeline"
description: End-to-end project integrating perception, planning, and control
---

# Capstone: Simple AI-Robot Pipeline

In this final chapter, we bring together all the concepts from the textbook to build a complete AI-robot pipeline. This hands-on project demonstrates how perception, planning, and control work together.

## Project Overview

We'll build a **pick-and-place system** that:

1. Perceives objects using a camera
2. Understands natural language commands
3. Plans and executes robot motions

```
┌─────────────────────────────────────────────────────┐
│                Complete Pipeline                     │
│                                                      │
│  "Pick up the red block"                            │
│         ↓                                           │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐   │
│  │ Perception │ → │ Planning  │ → │ Execution │   │
│  │  (Vision)  │    │  (Motion) │    │ (Control) │   │
│  └───────────┘    └───────────┘    └───────────┘   │
│         ↑                                ↓          │
│      Camera                          Robot Arm      │
└─────────────────────────────────────────────────────┘
```

## System Architecture

### Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| Perception | OpenCV + YOLO | Object detection |
| Language | LLM API | Command parsing |
| Planning | MoveIt 2 | Motion planning |
| Control | ros2_control | Joint execution |
| Simulation | Gazebo | Virtual testing |

### ROS 2 Node Graph

```
                    ┌─────────────────┐
                    │  Language Node  │
                    │ (Command Parse) │
                    └────────┬────────┘
                             │ /command
                             ↓
┌─────────────┐      ┌───────────────┐      ┌─────────────┐
│ Camera Node │ ───→ │  Main Node    │ ───→ │ MoveIt Node │
│ (/image)    │      │ (Coordinator) │      │ (/plan)     │
└─────────────┘      └───────────────┘      └─────────────┘
                             │
                             ↓ /joint_commands
                    ┌─────────────────┐
                    │ Controller Node │
                    │ (Robot Driver)  │
                    └─────────────────┘
```

## Step 1: Perception Module

### Object Detection

```python
import cv2
from ultralytics import YOLO

class PerceptionNode:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')
        self.objects = []

    def detect_objects(self, image):
        results = self.model(image)

        self.objects = []
        for r in results:
            for box in r.boxes:
                obj = {
                    'class': r.names[int(box.cls)],
                    'confidence': float(box.conf),
                    'bbox': box.xyxy[0].tolist(),
                    'center': self.get_center(box.xyxy[0])
                }
                self.objects.append(obj)

        return self.objects

    def find_object(self, description):
        """Find object matching description."""
        for obj in self.objects:
            if description.lower() in obj['class'].lower():
                return obj
        return None
```

### Coordinate Transformation

```python
def pixel_to_world(pixel_x, pixel_y, depth, camera_info):
    """Convert pixel coordinates to world frame."""
    # Camera intrinsics
    fx, fy = camera_info.K[0], camera_info.K[4]
    cx, cy = camera_info.K[2], camera_info.K[5]

    # 3D point in camera frame
    x = (pixel_x - cx) * depth / fx
    y = (pixel_y - cy) * depth / fy
    z = depth

    # Transform to world frame (using TF2)
    world_point = transform_point(
        Point(x, y, z),
        'camera_frame',
        'world'
    )
    return world_point
```

## Step 2: Language Understanding

### Command Parser

```python
import google.generativeai as genai

class LanguageNode:
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro')

    def parse_command(self, text):
        """Parse natural language to structured command."""
        prompt = f"""Parse this robot command into structured format:
Command: "{text}"

Return JSON with:
- action: pick/place/move
- object: what to manipulate
- target: where to place (if applicable)
- modifiers: any special instructions

Example: {{"action": "pick", "object": "red block", "target": null}}
"""
        response = self.model.generate_content(prompt)
        return json.loads(response.text)
```

### Supported Commands

| Command Type | Example |
|--------------|---------|
| Pick | "Pick up the red block" |
| Place | "Place it in the box" |
| Move | "Move the cup to the left" |
| Stack | "Stack the blocks" |

## Step 3: Motion Planning

### MoveIt 2 Integration

```python
from moveit2 import MoveIt2
from geometry_msgs.msg import Pose

class PlanningNode:
    def __init__(self):
        self.moveit = MoveIt2(
            node=self,
            joint_names=['joint_1', 'joint_2', 'joint_3',
                        'joint_4', 'joint_5', 'joint_6'],
            base_link='base_link',
            end_effector='gripper_link'
        )

    def plan_pick(self, object_pose):
        """Plan pick motion."""
        # Approach pose (above object)
        approach = Pose()
        approach.position = object_pose.position
        approach.position.z += 0.1  # 10cm above

        # Move to approach
        self.moveit.move_to_pose(approach)

        # Move down to grasp
        self.moveit.move_to_pose(object_pose)

        # Close gripper
        self.close_gripper()

        # Lift
        approach.position.z += 0.1
        self.moveit.move_to_pose(approach)
```

## Step 4: Execution and Control

### Main Coordinator

```python
class MainNode(Node):
    def __init__(self):
        super().__init__('main_node')

        self.perception = PerceptionNode()
        self.language = LanguageNode()
        self.planning = PlanningNode()

    def execute_command(self, text):
        """Full pipeline execution."""
        # 1. Parse command
        command = self.language.parse_command(text)
        self.get_logger().info(f'Parsed: {command}')

        # 2. Find object
        obj = self.perception.find_object(command['object'])
        if not obj:
            return False, f"Cannot find {command['object']}"

        # 3. Get 3D position
        world_pos = self.pixel_to_world(obj['center'])

        # 4. Execute action
        if command['action'] == 'pick':
            success = self.planning.plan_pick(world_pos)
        elif command['action'] == 'place':
            target_pos = self.get_target_position(command['target'])
            success = self.planning.plan_place(target_pos)

        return success, "Command completed"
```

## Step 5: Testing in Simulation

### Launch File

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Gazebo simulation
        IncludeLaunchDescription(
            'gazebo_ros', 'gazebo.launch.py',
            launch_arguments={'world': 'pick_place_world.sdf'}
        ),

        # Robot nodes
        Node(package='capstone', executable='perception_node'),
        Node(package='capstone', executable='language_node'),
        Node(package='capstone', executable='planning_node'),
        Node(package='capstone', executable='main_node'),
    ])
```

### Test Scenarios

```bash
# Test perception
ros2 topic echo /detected_objects

# Test language parsing
ros2 service call /parse_command std_srvs/srv/Trigger

# Test full pipeline
ros2 action send_goal /execute_command \
    capstone_interfaces/action/ExecuteCommand \
    "{command: 'Pick up the red block'}"
```

## Project Challenges

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Object not detected | Improve lighting, tune detection threshold |
| Grasp fails | Calibrate gripper, adjust approach angle |
| Motion planning fails | Check collision models, increase planning time |
| Command misunderstood | Improve prompt engineering, add examples |

## Extension Ideas

1. **Multi-object manipulation**: Handle multiple objects
2. **Learning from demonstration**: Record and replay tasks
3. **Voice interface**: Add speech recognition
4. **Mobile manipulation**: Combine with navigation
5. **Human collaboration**: Safe interaction

## Chapter Summary

This capstone project demonstrated:

- Integration of perception, language, and control
- ROS 2 architecture for robot applications
- Simulation-first development approach
- Practical debugging and testing strategies

## Congratulations!

You've completed the Physical AI & Humanoid Robotics textbook! You now have foundational knowledge in:

- Physical AI concepts and applications
- Humanoid robot design and control
- ROS 2 software development
- Digital twin simulation
- Vision-Language-Action systems
- End-to-end robot pipelines

**Keep building and learning!**

---

*Return to [Introduction](../intro)*
