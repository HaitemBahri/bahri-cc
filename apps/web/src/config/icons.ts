import Bulb from "@tabler/icons/outline/bulb.svg";
import Devices from "@tabler/icons/outline/devices.svg";
import School from "@tabler/icons/outline/school.svg";

// Icons content may reference by name (e.g. a service's `icon` frontmatter).
export const icons = { bulb: Bulb, devices: Devices, school: School };

export type IconName = keyof typeof icons;
