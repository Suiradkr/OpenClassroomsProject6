"""Cluster domain model.

Ported from P3 (OpenClassroomProject3/cluster.py). Same join/normalize logic,
plus a `description` field and safe timestamp handling.
"""
from datetime import datetime, timezone

from .vm_data_manager import VMDataManager


class Cluster:

    def __init__(self, cluster_id, data_manager: VMDataManager):
        self.id = cluster_id
        self.data_manager = data_manager
        self.podbox = ''
        self.version = ''
        self.description = ''
        self.created = ''
        self.username = ''
        self.status = ''

    def format_time(self, created_time):
        if not created_time or created_time == 'data not found':
            return 'data not found'
        try:
            dt_naive = datetime.fromisoformat(created_time.replace('Z', ''))
            dt_utc = dt_naive.replace(tzinfo=timezone.utc)
            return dt_utc.strftime("%d/%m/%Y %I:%M %p UTC")
        except ValueError:
            return created_time

    def set_cluster_info(self):
        self.podbox = self.data_manager.get_vm_podbox(self.id)
        self.version = self.data_manager.get_vm_version(self.id)
        self.description = self.data_manager.get_vm_description(self.id)
        self.created = self.format_time(
            self.data_manager.get_vm_details(self.id, 'created'))
        self.username = self.data_manager.get_vm_details(self.id, 'username')
        self.status = self.data_manager.get_vm_details(
            self.id, 'deployedstatus')

    def to_dict(self):
        return {
            "id": self.id,
            "podbox": self.podbox,
            "version": self.version,
            "description": self.description,
            "created": self.created,
            "username": self.username,
            "status": self.status,
        }

    def __str__(self):
        return (f"Cluster ID: {self.id}, Podbox: {self.podbox}, "
                f"Version: {self.version}, Created: {self.created}, "
                f"Username: {self.username}, Status: {self.status}")
