import os
import json
from PIL import Image  # Requires Pillow (PIL Fork): pip install Pillow

def build_json_from_folders(root_folder):
    """
    Builds a JSON structure from a system of folders.

    Args:
        root_folder: The root folder path.

    Returns:
        A dictionary representing the JSON structure, or None if an error occurs.
    """

    data = {}
    try:
        for item in os.listdir(root_folder):
            item_path = os.path.join(root_folder, item)
            if os.path.isdir(item_path):  # Check if it's a directory (like 'a', 'b')
                data[item] = {}
                for sub_item in os.listdir(item_path):
                    sub_item_path = os.path.join(item_path, sub_item)
                    if os.path.isdir(sub_item_path): #Check if its another directory (like '1', '2')
                        data[item][sub_item] = []
                        for file in os.listdir(sub_item_path):
                            file_path = os.path.join(sub_item_path, file)
                            if os.path.isfile(file_path) and file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')): #Check if its a file and an image
                                try:
                                    img = Image.open(file_path)
                                    width, height = img.size
                                    data[item][sub_item].append({
                                        "name": file,
                                        "size": f"{width}x{height}"
                                    })
                                except Exception as e:
                                    print(f"Error processing image {file_path}: {e}")
                    elif os.path.isfile(sub_item_path) and sub_item.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')): #Check if its a file and an image
                        try:
                            img = Image.open(sub_item_path)
                            width, height = img.size
                            data[item].append({
                                "name": sub_item,
                                "size": f"{width}x{height}"
                            })
                        except Exception as e:
                            print(f"Error processing image {sub_item_path}: {e}")
            elif os.path.isfile(item_path) and item.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')): #Check if its a file and an image
                try:
                    img = Image.open(item_path)
                    width, height = img.size
                    data[item] = {
                        "name": item,
                        "size": f"{width}x{height}"
                    }
                except Exception as e:
                    print(f"Error processing image {item_path}: {e}")
    except FileNotFoundError:
        print(f"Error: Root folder '{root_folder}' not found.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

    return data


# Example usage:
root_directory = "../src/assets/images/"  # Replace with your root folder path
json_data = build_json_from_folders(root_directory)

if json_data:
    with open("output.json", "w") as outfile:
        json.dump(json_data, outfile, indent=4) # indent for pretty printing
    print("JSON file 'output.json' created successfully.")