"""Data-access layer for the cluster ETL.

Ported from P3 (OpenClassroomProject3/vm_data_manager.py). Same simple loops,
but each JSON file is read once when the manager is created instead of being
re-read on every lookup.
"""
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')


class VMDataManager:

    def __init__(self, data_directory=DATA_DIR):
        self.all_vms = self._load(
            os.path.join(data_directory, 'get_all_vms.json'))
        self.lc_data = self._load(
            os.path.join(data_directory, 'get_lc_data.json'))
        self.podbox_data = self._load(
            os.path.join(data_directory, 'get_podbox_data.json'))
        self.vm_details = self._load(
            os.path.join(data_directory, 'get_vm_details.json'))

    def _load(self, file_path):
        with open(file_path, 'r') as f:
            return json.load(f)

    def get_all_vm_ids(self):
        return [vm['id'] for vm in self.all_vms]

    def get_vm_version(self, vm_id):
        for entry in self.lc_data:
            if entry[0]['deployedvm'] == vm_id:
                return entry[1]['version']
        return 'data not found'

    def get_vm_podbox(self, vm_id):
        for row in self.podbox_data:
            if row['id'] == vm_id:
                return row['podbox']
        return 'data not found'

    def get_vm_description(self, vm_id):
        for vm in self.all_vms:
            if vm['id'] == vm_id:
                return vm['description']
        return 'data not found'

    def get_vm_details(self, vm_id, info):
        for row in self.vm_details:
            if row['id'] == vm_id and info in row:
                return row[info]
        return 'data not found'
